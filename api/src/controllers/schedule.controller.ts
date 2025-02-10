import { Request, Response , NextFunction } from 'express';
import { createSchedule, getSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';
import { generateSchedule } from '../workflow';
import { NE } from '@langchain/core/structured_query';

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

    const userData = `
    Name: Prudvi Raj
    Hobbies: Reading books, playing chess, cycling
    Sleep Time: 10:30 PM to 6:00 AM
    Work: Software Developer at XYZ Company (9:00 AM to 5:00 PM)
    Preferences: Prefers morning workouts, enjoys a 30-minute meditation session daily, and likes to spend evenings with family.
    `;

    console.log(userData,"Sending userdata")
    const result = await generateSchedule(userData);
    console.log(result,"this is result");
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


