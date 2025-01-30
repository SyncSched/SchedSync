import { NextFunction, Request, Response } from "express";
import { createAdjustment } from "../services/adjustment.service";
import { CreateAdjustmentInput, AdjustmentDelta } from "../models/adjustment.model";
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

    const { scheduleId, delta } = req.body;
    if (!scheduleId || typeof scheduleId !== 'string') {
      return next(new BadUserInputError({ message: "Schedule ID is required" }));
    }
    if (!delta || !Array.isArray(delta)) {
      return next(new BadUserInputError({ message: "Adjustment data is missing or invalid" }));
    }

    const AdjustmentDeltas: AdjustmentDelta[] = delta.map((item: any) => {
      if (!item.change_type || !item.details) {
        throw new Error('Each delta item must have change_type and details');
      }
      return item as AdjustmentDelta; 
    });

    const adjustmentInput: CreateAdjustmentInput = {
      delta: AdjustmentDeltas,
      scheduleId
    };
    const adjustment = await createAdjustment(adjustmentInput);

    res.status(201).json(adjustment);
  } catch (error) {
    console.error("Error creating adjustment:", error);
    next(error); 
  }
};
