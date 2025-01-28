import { Request, Response } from 'express';
import { createSchedule } from '../services/schedule.service';
import { create } from 'domain';


export const createScheduleHandler = async(req:Request , res:Response): Promise<void> =>{
    try{
        const userId = (req.user as { sub: string })?.sub;
        const clientData = req.body;

        if(!userId || !clientData){
            res.status(400).json({ error: 'User ID error in Middleware and Authentication.' });
            return;
        }
        const createdSchedule = await createSchedule(clientData,userId);

        if(!createdSchedule){
            res.status(500).json({ error: 'Failed to create schedule.' });
            return;
        }
        console.log(createdSchedule);
        res.status(201).json(createdSchedule);
    }catch(error){
        console.error("Error Creating Schedule",error);
        res.status(500).json({error:'Failed to created a Schedule'});
    }
};

