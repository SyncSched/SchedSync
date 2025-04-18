import { Response, NextFunction } from 'express';
import { createSchedule, getSchedule, updateSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { AuthenticatedRequest } from '../types/request';
import { PrismaClient } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { getCurrentDayCalendarEvents, hasCalendarIntegration } from '../services/calendar.service';

const prisma = new PrismaClient();

export const getScheduleHandler = async(req:AuthenticatedRequest, res:Response, next:NextFunction) : Promise<void> =>{
    try{
        const userId = req.user?.id;
        const { date, timezoneOffset } = req.body;

        if(!userId || !date || timezoneOffset === undefined){
            return next(new BadUserInputError({message : "User ID, date, or timezone offset is not defined"}))
        }

        const requiredSchedule = await getSchedule(date, userId, timezoneOffset);

        if(!requiredSchedule)
            return next(new EntityNotFoundError("Failed to retrieve the schedule or it's not present"));

        res.status(201).json(requiredSchedule);
    }catch(err){
        // Check if this is a 'schedule not found' error
        if (err instanceof Error && (err as any).code === 'SCHEDULE_NOT_FOUND') {
            // Return a specific status code for schedule not found
            res.status(404).json({
                error: 'SCHEDULE_NOT_FOUND',
                message: err.message
            });
        } else {
            next(err);
        }
    }
}

export const generateScheduleHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new BadUserInputError({ message: "User ID is missing from request" }));
        }

        // Get user with timezone
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                timezone: true
            }
        });

        if (!user) {
            return next(new BadUserInputError({ message: "User not found" }));
        }

        // Start transaction to check and set lock
        const existingSchedule = await prisma.schedule.findFirst({
            where: {
                userId,
                status: "pending",
            },
        });

        if (existingSchedule) {
            return next(new BadUserInputError({ message: "A schedule generation is already in progress" }));
        }

        // Create a new schedule with "pending" status
        const lockedSchedule = await prisma.schedule.create({
            data: {
                userId,
                status: "pending",
            },
        });

        // Fetch complete user data including onboarding information
        const userWithOnboarding = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                onboardingData: true // Include onboarding data
            }
        });

        if (!userWithOnboarding || !userWithOnboarding.onboardingData) {
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
            return next(new EntityNotFoundError("User data or onboarding data not found. Please complete onboarding."));
        }

        // Check if user has calendar integration and fetch calendar events
        console.log(`[TIME] Starting calendar integration check at: ${new Date().toISOString()}`);
        const calendarStartTime = Date.now();
        let calendarEvents: any[] = [];

        // Create variables to track calendar integration errors
        let calendarEventsError = false;
        let calendarEventsErrorMessage = '';

        const hasCalendar = await hasCalendarIntegration(userId);

        if (hasCalendar) {
            try {
                // Get calendar events for today
                const today = new Date();
                console.log(`[TIME] Fetching calendar events at: ${new Date().toISOString()}`);
                const events = await getCurrentDayCalendarEvents(userId, today);
                console.log(`[TIME] Calendar events received at: ${new Date().toISOString()} (${Date.now() - calendarStartTime}ms)`);

                // Transform events into task format
                calendarEvents = events.map(event => {
                    // Extract start and end times
                    const startTime = event.start?.dateTime ? new Date(event.start.dateTime) : null;
                    const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;

                    // Calculate duration in minutes
                    const durationMinutes = startTime && endTime ?
                        Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) :
                        60; // Default to 1 hour if times are not available

                    // Format time as HH:MM
                    const formattedTime = startTime ?
                        `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}` :
                        '09:00'; // Default time if not available

                    return {
                        name: event.summary || 'Untitled Event',
                        description: event.description || '',
                        time: formattedTime,
                        duration: durationMinutes,
                        location: event.location || '',
                        isGoogleCalendarEvent: true, // Mark as Google Calendar event
                        googleEventId: event.id, // Store the Google event ID for reference
                        status: 'PENDING',
                        priority: 'HIGH', // Calendar events are typically high priority
                        isEmailEnabled: false,
                        isWhatsAppEnabled: false,
                        isTelegramEnabled: false,
                        isCallEnabled: false
                    };
                });

                console.log(`Found ${calendarEvents.length} calendar events for today`);
                console.log(`[TIME] Calendar events processing completed at: ${new Date().toISOString()} (${Date.now() - calendarStartTime}ms)`);
            } catch (error) {
                console.error('Error fetching calendar events for schedule generation:', error);
                console.log(`[TIME] Calendar events fetch failed at: ${new Date().toISOString()} (${Date.now() - calendarStartTime}ms)`);

                // Log a warning to the user about calendar events
                console.warn('Calendar events could not be fetched. Schedule will be generated without calendar events.');

                // Set the error flags to be used later
                calendarEventsError = true;
                calendarEventsErrorMessage = error instanceof Error ? error.message : 'Unknown error';

                // Continue without calendar events
            }
        } else {
            console.log(`[TIME] No calendar integration found at: ${new Date().toISOString()} (${Date.now() - calendarStartTime}ms)`);
        }

        // Add calendar events to user data for schedule generation
        const userDataWithCalendar = {
            ...userWithOnboarding,
            calendarEvents: calendarEvents,
            calendarEventsError,
            calendarEventsErrorMessage
        };

        // Debug log to verify calendar events
        console.log(`Adding ${calendarEvents.length} calendar events to user data:`,
            calendarEvents.map(event => ({ name: event.name, time: event.time, duration: event.duration })));

        // Generate the schedule with complete user information including calendar events
        console.log(`[TIME] Starting schedule generation workflow at: ${new Date().toISOString()}`);
        const scheduleGenStartTime = Date.now();
        const generatedSchedule = await generateSchedule(userDataWithCalendar);
        console.log(`[TIME] Schedule generation workflow completed at: ${new Date().toISOString()} (${Date.now() - scheduleGenStartTime}ms)`);

        if (!generatedSchedule) {
            console.log(`No schedule generated for user ${userId}, cleaning up...`);
            try {
                // Delete the locked schedule
                await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                console.log(`Deleted locked schedule ${lockedSchedule.id}`);

                // Also check for any other pending schedules for this user
                const otherPendingSchedules = await prisma.schedule.findMany({
                    where: {
                        userId,
                        status: "pending",
                        id: { not: lockedSchedule.id }
                    }
                });

                if (otherPendingSchedules.length > 0) {
                    console.log(`Found ${otherPendingSchedules.length} other pending schedules for user ${userId}`);
                    for (const schedule of otherPendingSchedules) {
                        await prisma.schedule.delete({ where: { id: schedule.id } });
                        console.log(`Deleted pending schedule ${schedule.id}`);
                    }
                }
            } catch (cleanupError) {
                console.error("Error during cleanup after failed schedule generation:", cleanupError);
            }

            return next(new EntityNotFoundError("Failed to generate schedule. Please try again later."));
        }

        // Clean and parse the schedule
        try {
            let cleanedSchedule = generatedSchedule.trim().replace(/^```json/, "").replace(/```$/, "");
            let parsedSchedule;

            try {
                parsedSchedule = JSON.parse(cleanedSchedule);
            } catch (parseError) {
                console.error("Error parsing schedule JSON:", parseError);
                console.log("Raw schedule data:", cleanedSchedule);

                // Clean up the schedule and throw an error
                await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                throw new Error("Invalid schedule format generated");
            }

            console.log(parsedSchedule,"GENERATED SCHEDULE");

            // Validate that we have tasks
            if (!Array.isArray(parsedSchedule) || parsedSchedule.length === 0) {
                console.error("Generated schedule is empty or not an array");
                await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                throw new Error("No tasks were generated in the schedule");
            }

            // Convert time strings to UTC DateTime format
            const formattedTasks = parsedSchedule.map((task: any) => {
                // Get user's timezone from the database
                const userTimezone = user.timezone; // assuming 'Asia/Kolkata' for IST

                // Create a date object in user's local timezone
                const [taskHours, taskMinutes] = task.time.split(':');
                const localDate = new Date();

                // First, set the time in user's local timezone
                const localDateTime = formatInTimeZone(
                    localDate,
                    userTimezone,
                    `yyyy-MM-dd'T'${taskHours.padStart(2, '0')}:${taskMinutes.padStart(2, '0')}:00.000XXX`
                );

                // Convert local time to UTC
                const utcTime = new Date(localDateTime);

                // We now use the Date object directly instead of formatting as a string

                return {
                    name: task.name,
                    time: utcTime, // Use the actual Date object for Prisma
                    duration: task.duration,
                    isEmailEnabled: task.isEmailEnabled === true,
                    isWhatsAppEnabled: task.isWhatsAppEnabled === true,
                    isTelegramEnabled: task.isTelegramEnabled === true,
                    isCallEnabled: task.isCallEnabled === true
                };
            });

            // Save the final schedule
            const createdSchedule = await prisma.schedule.update({
                where: { id: lockedSchedule.id },
                data: {
                    originalData: {
                        create: formattedTasks
                    },
                    status: "completed"
                },
                include: {
                    originalData: true,
                    user: true
                }
            });

            res.status(201).json(createdSchedule);
        } catch (innerError) {
            console.error("Error processing generated schedule:", innerError);

            // Clean up the schedule
            try {
                await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                console.log(`Deleted schedule ${lockedSchedule.id} after processing error`);
            } catch (cleanupError) {
                console.error("Error cleaning up schedule after processing error:", cleanupError);
            }

            throw innerError; // Re-throw to be caught by the outer catch block
        }
    } catch (error) {
        // Error handling with proper userId scope
        const currentUserId = req.user?.id;

        // Log the error with detailed information
        console.error("Error generating schedule:", error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : error);

        // Always attempt to clean up any pending schedules for this user
        try {
            // Find ALL pending schedules for this user, not just the one we created
            const pendingSchedules = await prisma.schedule.findMany({
                where: {
                    userId: currentUserId,
                    status: "pending"
                }
            });

            // Delete all pending schedules
            if (pendingSchedules.length > 0) {
                console.log(`Cleaning up ${pendingSchedules.length} pending schedules for user ${currentUserId}`);

                for (const schedule of pendingSchedules) {
                    await prisma.schedule.delete({ where: { id: schedule.id } });
                    console.log(`Deleted pending schedule ${schedule.id}`);
                }
            } else {
                console.log(`No pending schedules found for user ${currentUserId}`);
            }
        } catch (cleanupError) {
            console.error("Error cleaning up locked schedules:", cleanupError);
        }

        // Return a more descriptive error to the client
        next(new Error("Failed to generate schedule. Please try again later."));
    }
};


export const createScheduleHandler = async(req:AuthenticatedRequest , res:Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id; //This is a bad code -> bypassing TS , Remove this bug
        // const userId = req.user?.id;
        const clientData = req.body;


        if (!userId || !clientData) {
            return next(new BadUserInputError({ message: "User ID or client data is missing" }));
        }
        const scheduleInput : CreateScheduleInput ={
            originalData:clientData.originalData,
            userId
        }
        const createdSchedule = await createSchedule(scheduleInput);

        if (!createdSchedule) {
            return next(new EntityNotFoundError("Failed to create Schedule"));
        }

        res.status(201).json(createdSchedule);
    } catch (error) {
        next(error);
    }
};

export const updateScheduleHandler = async(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const scheduleId = req.params.id;
        const userId = req.user?.id;
        const { originalData } = req.body;

        if (!scheduleId || !userId || !originalData) {
            return next(new BadUserInputError({ message: "Schedule ID, user ID, or schedule data is missing" }));
        }

        // Verify schedule belongs to user
        const schedule = await prisma.schedule.findFirst({
            where: {
                id: scheduleId,
                userId: userId
            }
        });

        if (!schedule) {
            return next(new EntityNotFoundError("Schedule not found or unauthorized"));
        }

        const updatedSchedule = await updateSchedule(scheduleId, { originalData });

        if (!updatedSchedule) {
            return next(new EntityNotFoundError("Failed to update schedule"));
        }

        res.status(200).json(updatedSchedule);
    } catch (error) {
        next(error);
    }
};

/**
 * Cleans up any pending schedules for the current user
 */
export const cleanupPendingSchedulesHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new BadUserInputError({ message: "User ID is missing from request" }));
        }

        // Find all pending schedules for this user
        const pendingSchedules = await prisma.schedule.findMany({
            where: {
                userId,
                status: "pending"
            }
        });

        // Delete all pending schedules
        let deletedCount = 0;
        if (pendingSchedules.length > 0) {
            console.log(`Cleaning up ${pendingSchedules.length} pending schedules for user ${userId}`);

            for (const schedule of pendingSchedules) {
                await prisma.schedule.delete({ where: { id: schedule.id } });
                console.log(`Deleted pending schedule ${schedule.id}`);
                deletedCount++;
            }
        }

        res.status(200).json({ success: true, deletedCount });
    } catch (error) {
        console.error("Error cleaning up pending schedules:", error);
        next(error);
    }
};
