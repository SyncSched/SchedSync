import { Request, Response , NextFunction } from 'express';
import { createSchedule, getSchedule, updateSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { getOnboardingData } from '../services/onboarding.service';
import { AuthenticatedRequest } from '../types/request';
import { PrismaClient } from '@prisma/client';
import { acquireLock, releaseLock } from '../utils/redisLock';

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

export const generateScheduleHandler = async(req:AuthenticatedRequest , res:Response , next : NextFunction) : Promise<void> =>{
    const userId = req.user?.id;
    if (!userId) {
        return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    // Try to acquire lock for this user
    const lockAcquired = await acquireLock(userId, 20); // 60 seconds TTL
    if (!lockAcquired) {
        return next(new BadUserInputError({ message: "Schedule generation already in progress for this user" }));
    }

    try {
        // Fetch user onboarding data from the database
        const onboardingData = await getOnboardingData(userId);
        console.log("users ONBOARDING DATA" , onboardingData);

        if (!onboardingData) {
            return next(new EntityNotFoundError("Onboarding data not found. Please complete onboarding."));
        }
          
        // Convert to a string
        const userData = JSON.stringify(onboardingData);
                
        const generatedSchedule  = await generateSchedule(userData);
        if (!generatedSchedule) {
            return next(new EntityNotFoundError("Failed to generate schedule"));
        }

        console.log("Schedule generated successfully:", generatedSchedule);

        let cleanedSchedule = generatedSchedule
        .trim() // Remove leading/trailing spaces
        .replace(/^```json/, "") // Remove starting ```json if present
        .replace(/```$/, ""); // Remove ending ``` if present

        let parsedSchedule;
        try {
            parsedSchedule = JSON.parse(cleanedSchedule);
        } catch (error) {
            console.error("Error parsing generated schedule:", error);
            return next(new BadUserInputError({ message: "Invalid schedule format received" }));
        }
      
        const scheduleInput: CreateScheduleInput = {
            originalData: parsedSchedule,
            userId,
        };
        
        const createdSchedule = await createSchedule(scheduleInput);
        if (!createdSchedule) {
            return next(new EntityNotFoundError("Failed to save generated schedule"));
        }

        res.status(201).json(createdSchedule);
    } catch (error) {
        next(error);
    } finally {
        // Always release the lock, even if an error occurred
        await releaseLock(userId);
    }
}

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


