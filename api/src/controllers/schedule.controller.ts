import { Request, Response , NextFunction } from 'express';
import { createSchedule, getSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { getOnboardingData } from '../services/onboarding.service';

export const getScheduleHandler = async(req:Request,res:Response,next:NextFunction) : Promise<void> =>{
    try{
        const userId = (req.user as {id:string})?.id;
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

export const generateScheduleHandler = async(req:Request , res:Response , next : NextFunction) : Promise<void> =>{
    const userId = (req.user as {id:string})?.id;
    if (!userId) {
        return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    // Fetch user onboarding data from the database
    const onboardingData = await getOnboardingData(userId);

    if (!onboardingData) {
        return next(new EntityNotFoundError("Onboarding data not found. Please complete onboarding."));
    }
    // const onboardingData = {
    //     id: "clp9z9j6k0001xyz123456abc",
    //     profession: "Game Developer, Web Developer, Competitive Programmer",
    //     hobbies: ["Gaming", "Game Development", "Competitive Programming", "Exploring AI"],
      
    //     sleepingHours: 6,
    //     sleepingStart: "2025-02-10T01:30:00.000Z",
    //     sleepingEnd: "2025-02-10T07:30:00.000Z",
      
    //     workingHours: 8,
    //     workingStart: "2025-02-10T10:00:00.000Z",
    //     workingEnd: "2025-02-10T18:00:00.000Z",
      
    //     userId: "prudviraj123",
    //     user: {
    //       id: "prudviraj123"
    //     }
    //   };
      
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

export const createScheduleHandler = async(req:Request , res:Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req.user as { id: string })?.id; //This is a bad code -> bypassing TS , Remove this bug
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


