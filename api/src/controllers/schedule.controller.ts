import { Request, Response , NextFunction } from 'express';
import { createSchedule, getSchedule, updateSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { getOnboardingData } from '../services/onboarding.service';
import { AuthenticatedRequest } from '../types/request';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const getScheduleHandler = async(req:AuthenticatedRequest,res:Response,next:NextFunction) : Promise<void> =>{
    try{
        const userId = req.user?.id;
        const date = req.body.date;

        if(!userId || !date){
            return next(new BadUserInputError({message : "user Id or Date is not defined"}))
        }

        const requiredSchedule = await getSchedule(date,userId);

        if(!requiredSchedule)
            return next(new EntityNotFoundError("Failed to retrive the schedule or it's not present"));

        res.status(201).json(requiredSchedule); 
    }catch(err){
        next(err);
    }
}

export const generateScheduleHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    try {
        // Start transaction to check and set lock
        const existingSchedule = await prisma.schedule.findFirst({
            where: {
                userId,
                status: "pending",
            },
        });

        if (existingSchedule) {
            console.log("Schedule is already being generated.@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            return next(new BadUserInputError({ message: "A schedule generation is already in progress" }));
        }

        // Create a new schedule with "pending" status to lock the process
        const lockedSchedule = await prisma.schedule.create({
            data: {
                userId,
                status: "pending",
            },
        });

        // Fetch onboarding data
        const onboardingData = await getOnboardingData(userId);
        if (!onboardingData) {
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } }); // Release lock
            return next(new EntityNotFoundError("Onboarding data not found. Please complete onboarding."));
        }

        // Convert to a string
        const userData = JSON.stringify(onboardingData);

        // Generate the schedule
        const generatedSchedule = await generateSchedule(userData);
        if (!generatedSchedule) {
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } }); // Release lock
            return next(new EntityNotFoundError("Failed to generate schedule"));
        }

        // Clean the schedule response
        let cleanedSchedule = generatedSchedule.trim().replace(/^```json/, "").replace(/```$/, "");

        let parsedSchedule;
        try {
            parsedSchedule = JSON.parse(cleanedSchedule);
        } catch (error) {
            console.error("Error parsing generated schedule:", error);
            await prisma.schedule.delete({ where: { id: lockedSchedule.id } }); // Release lock
            return next(new BadUserInputError({ message: "Invalid schedule format received" }));
        }

        // Save the final schedule
        const createdSchedule = await prisma.schedule.update({
            where: { id: lockedSchedule.id },
            data: {
                originalData: {
                    create: parsedSchedule.map((task: any) => ({
                        name: task.name,
                        time: task.time,
                        duration: task.duration
                    }))
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
        console.error("Error generating schedule:", error);
        return next(new Error("Internal server error"));
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


