import { Request, Response , NextFunction } from 'express';
import { createSchedule, getSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { getOnboardingData } from '../services/onboarding.service';
import { AuthenticatedRequest } from '../types/request';

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

    // Fetch user onboarding data from the database
    const onboardingData = await getOnboardingData(userId);

    if (!onboardingData) {
        return next(new EntityNotFoundError("Onboarding data not found. Please complete onboarding."));
    }
      
      // Convert to a string
    const userData = JSON.stringify(onboardingData);
            

    console.log(userData,"Sending userdata")
    const generatedSchedule  = await generateSchedule(userData);
    if (!generatedSchedule) {
        return next(new EntityNotFoundError("Failed to generate schedule"));
    }

    console.log("Schedule generated successfully:", generatedSchedule);

    const parsedSchedule = typeof generatedSchedule === "string" ? JSON.parse(generatedSchedule) : generatedSchedule;

    const scheduleInput: CreateScheduleInput = {
        originalData: parsedSchedule, // ✅ Now it's a Task[] instead of string
        userId,
    };
    

    const createdSchedule = await createSchedule(scheduleInput);
    if (!createdSchedule) {
        return next(new EntityNotFoundError("Failed to save generated schedule"));
    }

    res.status(201).json(createdSchedule);
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


