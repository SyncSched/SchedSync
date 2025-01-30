import { Request, Response , NextFunction } from 'express';
import { createSchedule } from '../services/schedule.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';


export const createScheduleHandler = async(req:Request , res:Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req.user as { id: string })?.id; //This is a bad code -> bypassing TS , Remove this bug
        // const userId = req.user?.id;
        const clientData = req.body;

        if (!userId || !clientData) {
            return next(new BadUserInputError({ message: "User ID or client data is missing" }));
        }

        const createdSchedule = await createSchedule(clientData, userId);

        if (!createdSchedule) {
            return next(new EntityNotFoundError("Failed to create Schedule"));
        }

        res.status(201).json(createdSchedule);
    } catch (error) {
        next(error); 
    }
};


