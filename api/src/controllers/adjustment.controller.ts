import { NextFunction, Request, Response } from "express";
import { createAdjustment } from "../services/adjustment.service";
import { createTask } from "../services/task.service";
import { CreateAdjustmentInput } from "../models/adjustment.model";
import { BadUserInputError } from "../errors";
import { Task } from "../models/schedule.model";
import { AuthenticatedRequest } from "../types/request";

export const createAdjustmentHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;  //This is a bad code -> bypassing TS , Remove this bug
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

    let taskId = task_id;

    if(!taskId){

      if(details.name || details.time || details.duration){
        return next(new BadUserInputError({message: " no details provided inorder to create a new task"}));
      }

      const taskInput = {
        name : details.name,
        time : details.time,
        duration : details.duration,
        scheduleId,
      }
      const newTask: Task = await createTask(taskInput.name, taskInput.time, taskInput.duration, taskInput.scheduleId);

      taskId = newTask.id;
    }


    const adjustmentInput: CreateAdjustmentInput = {
      userId,
      task_id : taskId,
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
