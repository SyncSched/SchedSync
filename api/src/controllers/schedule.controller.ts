import { Request, Response, NextFunction } from 'express';
import { createSchedule, getSchedule, updateSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { getOnboardingData } from '../services/onboarding.service';
import { AuthenticatedRequest } from '../types/request';
import { PrismaClient } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';

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
        next(err);
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
            console.log("Schedule is already being generated.");
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

        // Generate the schedule with complete user information
        const generatedSchedule = await generateSchedule(userWithOnboarding);
        if (!generatedSchedule) {
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
            return next(new EntityNotFoundError("Failed to generate schedule"));
        }

        // Clean and parse the schedule
        let cleanedSchedule = generatedSchedule.trim().replace(/^```json/, "").replace(/```$/, "");
        let parsedSchedule = JSON.parse(cleanedSchedule);

        // Convert time strings to UTC DateTime format
        const formattedTasks = parsedSchedule.map((task: any) => {
            // Get user's timezone from the database
            const userTimezone = user.timezone; // assuming 'Asia/Kolkata' for IST

            // Create a date object in user's local timezone
            const [hours, minutes] = task.time.split(':');
            const localDate = new Date();
            
            // First, set the time in user's local timezone
            const localDateTime = formatInTimeZone(
                localDate,
                userTimezone,
                `yyyy-MM-dd'T'${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000XXX`
            );

            // Convert local time to UTC
            const utcTime = new Date(localDateTime);

            return {
                name: task.name,
                time: utcTime, // This will now store the correct UTC time
                duration: task.duration,
                isEmailEnabled: task.isEmailEnabled,
                isWhatsAppEnabled: task.isWhatsAppEnabled,
                isTelegramEnabled: task.isTelegramEnabled,
                isCallEnabled: task.isCallEnabled
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
    } catch (error) {
        // Error handling with proper userId scope
        const currentUserId = req.user?.id;
        if (error instanceof Error) {
            console.error("Error generating schedule:", error);
            try {
                const lockedSchedule = await prisma.schedule.findFirst({
                    where: { 
                        userId: currentUserId, 
                        status: "pending" 
                    }
                });
                if (lockedSchedule) {
                    await prisma.schedule.delete({ where: { id: lockedSchedule.id } });
                }
            } catch (cleanupError) {
                console.error("Error cleaning up locked schedule:", cleanupError);
            }
        }
        next(new Error("Internal server error"));
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


