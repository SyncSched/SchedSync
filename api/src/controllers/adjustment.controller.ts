import { Request, Response } from "express";
import { createAdjustment } from "../services/adjustment.service";
import { CreateAdjustmentInput } from "../models/adjustment.model";

export const createAdjustmentHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id; // From authentication middleware
    const scheduleId = req.body.schedule_id; // From request body

    const adjustmentInput: CreateAdjustmentInput = {
      delta: {
        user_id: userId,
        schedule_id: scheduleId,
        delta: req.body.delta
      }
    };

    const adjustment = await createAdjustment(adjustmentInput);
    
    res.status(201).json(adjustment);
  } catch (error) {
    console.error("Error creating adjustment:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create adjustment"
    });
  }
};