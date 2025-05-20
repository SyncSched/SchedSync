import { Response, NextFunction } from 'express';
import { createSchedule, getSchedule, updateSchedule, getWeekSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { AuthenticatedRequest } from '../types/request';
import { PrismaClient } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { getRescheduledTasksForDate } from '../services/rescheduled-task.service';

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

        // Use a transaction to check for existing schedules and create a new one atomically
        // This prevents race conditions where multiple schedules could be created simultaneously
        let lockedSchedule;
        try {
            // First, clean up any stale pending schedules that might be left over from previous attempts
            const stalePendingSchedules = await prisma.schedule.findMany({
                where: {
                    userId,
                    status: "pending",
                    createdAt: {
                        lt: new Date(Date.now() - 10 * 60 * 1000) // Older than 10 minutes
                    }
                }
            });

            if (stalePendingSchedules.length > 0) {
                console.log(`Found ${stalePendingSchedules.length} stale pending schedules for user ${userId}`);
                for (const schedule of stalePendingSchedules) {
                    await prisma.schedule.delete({ where: { id: schedule.id } });
                    console.log(`Deleted stale pending schedule ${schedule.id}`);
                }
            }

            // Now use a transaction to ensure atomicity
            lockedSchedule = await prisma.$transaction(async (tx) => {
                // Check for any existing pending schedules within the transaction
                const existingSchedule = await tx.schedule.findFirst({
                    where: {
                        userId,
                        status: "pending",
                    },
                });

                if (existingSchedule) {
                    throw new BadUserInputError({ message: "A schedule generation is already in progress" });
                }

                // Create a new schedule with "pending" status
                const newSchedule = await tx.schedule.create({
                    data: {
                        userId,
                        status: "pending",
                    },
                });

                console.log(`Created locked schedule ${newSchedule.id} for user ${userId} in transaction`);
                return newSchedule;
            }, {
                timeout: 10000, // 10 seconds timeout for this transaction
                isolationLevel: "Serializable" // Highest isolation level to prevent race conditions
            });
        } catch (createError) {
            if (createError instanceof BadUserInputError) {
                return next(createError);
            }
            console.error("Error creating locked schedule:", createError);
            return next(new Error("Failed to create schedule. Please try again later."));
        }

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

        // Calendar integration has been removed to avoid timeouts in production
        console.log(`[TIME] Calendar integration has been disabled at: ${new Date().toISOString()}`);
        let calendarEvents: any[] = [];

        // Variables needed for the user data object
        let calendarEventsError = false;
        let calendarEventsErrorMessage = 'Calendar integration disabled';

        // Fetch rescheduled tasks for today
        console.log(`[TIME] Starting rescheduled tasks fetch at: ${new Date().toISOString()}`);
        const rescheduledTasksStartTime = Date.now();
        const today = new Date();
        const rescheduledTasks = await getRescheduledTasksForDate(userId, today);
        console.log(`[TIME] Rescheduled tasks fetch completed at: ${new Date().toISOString()} (${Date.now() - rescheduledTasksStartTime}ms)`);
        console.log(`Found ${rescheduledTasks.length} rescheduled tasks for today`);

        // Format rescheduled tasks for the prompt
        const formattedRescheduledTasks = rescheduledTasks.map(rt => ({
            name: rt.task.name,
            description: rt.task.description || '',
            time: rt.rescheduledTime, // This is already in HH:MM format
            duration: rt.task.duration,
            location: rt.task.location || '',
            isRescheduledTask: true, // Mark as rescheduled task
            originalTaskId: rt.taskId,
            originalTaskTime: rt.originalTaskTime,
            reason: rt.reason || '',
            priority: rt.task.priority,
            isEmailEnabled: rt.task.isEmailEnabled,
            isWhatsAppEnabled: rt.task.isWhatsAppEnabled,
            isTelegramEnabled: rt.task.isTelegramEnabled,
            isCallEnabled: rt.task.isCallEnabled
        }));

        // Add calendar events and rescheduled tasks to user data for schedule generation
        const userDataWithCalendar = {
            ...userWithOnboarding,
            calendarEvents: calendarEvents,
            calendarEventsError,
            calendarEventsErrorMessage,
            rescheduledTasks: formattedRescheduledTasks
        };

        // Debug log to verify calendar events and rescheduled tasks
        console.log(`Adding ${calendarEvents.length} calendar events to user data:`,
            calendarEvents.map(event => ({ name: event.name, time: event.time, duration: event.duration })));
        console.log(`Adding ${formattedRescheduledTasks.length} rescheduled tasks to user data:`,
            formattedRescheduledTasks.map(task => ({ name: task.name, time: task.time, duration: task.duration })));

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

            // Use a single transaction for all database operations to ensure consistency
            try {
                // Use a transaction with a longer timeout and serializable isolation level
                const createdScheduleWithTasks = await prisma.$transaction(async (tx) => {
                    // First, check if the schedule still exists
                    const scheduleExists = await tx.schedule.findUnique({
                        where: { id: lockedSchedule.id }
                    });

                    let scheduleId = lockedSchedule.id;

                    if (!scheduleExists) {
                        console.log(`Schedule ${lockedSchedule.id} no longer exists, creating a new one in transaction`);
                        // Create a new schedule within the transaction
                        const newSchedule = await tx.schedule.create({
                            data: {
                                userId,
                                status: "pending",
                            }
                        });
                        scheduleId = newSchedule.id;
                        console.log(`Created new schedule ${scheduleId} in transaction`);
                    }

                    // Check for any other pending schedules for this user and mark them as failed
                    const otherPendingSchedules = await tx.schedule.findMany({
                        where: {
                            userId,
                            status: "pending",
                            id: { not: scheduleId }
                        }
                    });

                    if (otherPendingSchedules.length > 0) {
                        console.log(`Found ${otherPendingSchedules.length} other pending schedules for user ${userId}`);
                        for (const schedule of otherPendingSchedules) {
                            await tx.schedule.update({
                                where: { id: schedule.id },
                                data: { status: "failed" }
                            });
                            console.log(`Marked pending schedule ${schedule.id} as failed`);
                        }
                    }

                    // Update the schedule status
                    await tx.schedule.update({
                        where: { id: scheduleId },
                        data: {
                            status: "completed"
                        }
                    });

                    // Create all tasks in a batch
                    const taskPromises = formattedTasks.map(task =>
                        tx.task.create({
                            data: {
                                ...task,
                                scheduleId: scheduleId,
                                status: 'PENDING',
                                priority: 'MEDIUM',
                                description: '',
                                notes: '',
                                location: null,
                                completedAt: null
                            }
                        })
                    );

                    await Promise.all(taskPromises);

                    // Return the updated schedule with tasks
                    return tx.schedule.findUnique({
                        where: { id: scheduleId },
                        include: {
                            originalData: true,
                            user: true
                        }
                    });
                }, {
                    timeout: 60000, // 60 seconds timeout for this transaction
                    isolationLevel: "Serializable" // Highest isolation level to prevent race conditions
                });

                if (!createdScheduleWithTasks) {
                    throw new Error("Failed to create schedule with tasks");
                }

                // Send the response with the created schedule
                res.status(201).json(createdScheduleWithTasks);
                return; // Return to prevent further execution

            } catch (txError) {
                console.error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`);

                // Clean up any pending schedules for this user
                try {
                    // Find ALL pending schedules for this user
                    const pendingSchedules = await prisma.schedule.findMany({
                        where: {
                            userId,
                            status: "pending"
                        }
                    });

                    // Delete all pending schedules
                    if (pendingSchedules.length > 0) {
                        console.log(`Cleaning up ${pendingSchedules.length} pending schedules for user ${userId}`);

                        for (const schedule of pendingSchedules) {
                            await prisma.schedule.delete({ where: { id: schedule.id } });
                            console.log(`Deleted pending schedule ${schedule.id}`);
                        }
                    }
                } catch (cleanupError) {
                    console.error("Error cleaning up pending schedules:", cleanupError);
                }

                // Throw the error to be caught by the outer catch block
                throw new Error(`Failed to create schedule: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
            }
        } catch (innerError) {
            console.error("Error processing generated schedule:", innerError);

            // Clean up the schedule
            try {
                // First check if the schedule still exists
                const scheduleToDelete = await prisma.schedule.findUnique({
                    where: { id: lockedSchedule.id }
                });

                if (scheduleToDelete) {
                    await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                    console.log(`Deleted schedule ${lockedSchedule.id} after processing error`);
                } else {
                    console.log(`Schedule ${lockedSchedule.id} already deleted or does not exist`);
                }

                // Check for any other pending schedules for this user and clean them up
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
                    try {
                        // Check if the schedule still exists before trying to delete it
                        const scheduleExists = await prisma.schedule.findUnique({
                            where: { id: schedule.id }
                        });

                        if (scheduleExists) {
                            await prisma.schedule.delete({ where: { id: schedule.id } });
                            console.log(`Deleted pending schedule ${schedule.id}`);
                        } else {
                            console.log(`Schedule ${schedule.id} already deleted or does not exist`);
                        }
                    } catch (deleteError) {
                        console.error(`Error deleting schedule ${schedule.id}:`, deleteError);
                    }
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

/**
 * Get the schedule for an entire week
 */
export const getWeekScheduleHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate, timezoneOffset } = req.body;

        if (!userId || !startDate || !endDate || timezoneOffset === undefined) {
            return next(new BadUserInputError({ message: "User ID, start date, end date, or timezone offset is not defined" }));
        }

        const weekSchedule = await getWeekSchedule(startDate, endDate, userId, timezoneOffset);

        if (!weekSchedule || weekSchedule.length === 0) {
            return next(new EntityNotFoundError("No schedules found for the specified week"));
        }

        res.status(200).json(weekSchedule);
    } catch (error) {
        next(error);
    }
};
