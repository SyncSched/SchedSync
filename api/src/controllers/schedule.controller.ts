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
        let lockedSchedule;
        try {
            lockedSchedule = await prisma.schedule.create({
                data: {
                    userId,
                    status: "pending",
                },
            });

            // Verify the schedule was created
            const verifySchedule = await prisma.schedule.findUnique({
                where: { id: lockedSchedule.id }
            });

            if (!verifySchedule) {
                throw new Error(`Failed to verify creation of schedule ${lockedSchedule.id}`);
            }
        } catch (createError) {
            console.error("Error creating locked schedule:", createError);
            return next(new Error("Failed to create schedule. Please try again later."));
        }

        // Fetch complete user data including onboarding information
        const userWithOnboarding = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                onboardingData: true
            }
        });

        if (!userWithOnboarding || !userWithOnboarding.onboardingData) {
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
            return next(new EntityNotFoundError("User data or onboarding data not found. Please complete onboarding."));
        }

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
            time: rt.rescheduledTime,
            duration: rt.task.duration,
            location: rt.task.location || '',
            isRescheduledTask: true,
            originalTaskId: rt.taskId,
            originalTaskTime: rt.originalTaskTime,
            reason: rt.reason || '',
            priority: rt.task.priority,
            isEmailEnabled: rt.task.isEmailEnabled,
            isWhatsAppEnabled: rt.task.isWhatsAppEnabled,
            isTelegramEnabled: rt.task.isTelegramEnabled,
            isCallEnabled: rt.task.isCallEnabled
        }));

        // Prepare user data for schedule generation
        const userDataForSchedule = {
            ...userWithOnboarding,
            rescheduledTasks: formattedRescheduledTasks
        };

        // Generate the schedule with user information and rescheduled tasks
        console.log(`[TIME] Starting schedule generation workflow at: ${new Date().toISOString()}`);
        const scheduleGenStartTime = Date.now();
        const generatedSchedule = await generateSchedule(userDataForSchedule);
        console.log(`[TIME] Schedule generation workflow completed at: ${new Date().toISOString()} (${Date.now() - scheduleGenStartTime}ms)`);

        if (!generatedSchedule) {
            console.log(`No schedule generated for user ${userId}, cleaning up...`);
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
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
                await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                throw new Error("Invalid schedule format generated");
            }

            // Validate the parsed schedule
            if (!Array.isArray(parsedSchedule) || parsedSchedule.length === 0) {
                console.error("Generated schedule is empty or not an array");
                await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                throw new Error("No tasks were generated in the schedule");
            }

            // Convert time strings to UTC DateTime format
            const formattedTasks = parsedSchedule.map((task: any) => {
                const [taskHours, taskMinutes] = task.time.split(':');
                const localDate = new Date();
                const localDateTime = formatInTimeZone(
                    localDate,
                    user.timezone,
                    `yyyy-MM-dd'T'${taskHours.padStart(2, '0')}:${taskMinutes.padStart(2, '0')}:00.000XXX`
                );
                const utcTime = new Date(localDateTime);

                return {
                    name: task.name,
                    time: utcTime,
                    duration: task.duration,
                    isEmailEnabled: task.isEmailEnabled === true,
                    isWhatsAppEnabled: task.isWhatsAppEnabled === true,
                    isTelegramEnabled: task.isTelegramEnabled === true,
                    isCallEnabled: task.isCallEnabled === true
                };
            });

            // Use transaction to create tasks
            await prisma.$transaction(async (tx) => {
                await tx.schedule.update({
                    where: { id: lockedSchedule.id },
                    data: { status: "completed" }
                });

                for (const task of formattedTasks) {
                    await tx.task.create({
                        data: {
                            ...task,
                            scheduleId: lockedSchedule.id,
                            status: 'PENDING',
                            priority: 'MEDIUM',
                            description: '',
                            notes: '',
                            location: null,
                            completedAt: null
                        }
                    });
                }
            });

            const createdSchedule = await prisma.schedule.findUnique({
                where: { id: lockedSchedule.id },
                include: {
                    originalData: true,
                    user: true
                }
            });

            if (!createdSchedule) {
                throw new Error("Failed to retrieve the created schedule");
            }

            res.status(201).json(createdSchedule);
        } catch (error) {
            console.error("Error processing schedule:", error);
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
            throw error;
        }
    } catch (error) {
        console.error("Error generating schedule:", error);
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
