import { Request, Response , NextFunction } from 'express';
import { createSchedule, getSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { CreateScheduleInput } from '../models/schedule.model';

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


