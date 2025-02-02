import { NextFunction, Request, Response } from "express";
import { createAdjustment } from "../services/adjustment.service";
import { CreateAdjustmentInput } from "../models/adjustment.model";
import { BadUserInputError } from "../errors";

export const createAdjustmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as { id: string })?.id;  //This is a bad code -> bypassing TS , Remove this bug
    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing or not authenticated" }));
    }

    const { scheduleId, task_id , change_type , details } = req.body;

    if (!scheduleId || typeof scheduleId !== 'string') {
      return next(new BadUserInputError({ message: "Schedule ID is required" }));
    }

    if(!change_type || !details){
      return next(new BadUserInputError({ message : "details or change type not provided"}))
    }


    const adjustmentInput: CreateAdjustmentInput = {
      userId,
      task_id,
      change_type,
      details,
      scheduleId
    };
    const adjustment = await createAdjustment(adjustmentInput);

    res.status(201).json(adjustment);
  } catch (error) {
    console.error("Error creating adjustment:", error);
    next(error); 
  }
};
