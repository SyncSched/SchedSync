import { Response, NextFunction } from "express";
import {
  getRescheduledTasksByUserId,
  getRescheduledTasksByTaskId,
  getRescheduledTaskById,
  deleteRescheduledTask,
  updateRescheduledTask
} from "../services/rescheduled-task.service";
import { BadUserInputError } from "../errors";
import { AuthenticatedRequest } from "../types/request";

/**
 * Get all rescheduled tasks for the current user
 */
export const getUserRescheduledTasksHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    const rescheduledTasks = await getRescheduledTasksByUserId(userId);

    return res.json({
      message: "Rescheduled tasks retrieved successfully",
      rescheduledTasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rescheduled tasks for a specific task
 */
export const getTaskRescheduledTasksHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { taskId } = req.params;

    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    if (!taskId) {
      return next(new BadUserInputError({ message: "Task ID is required" }));
    }

    const rescheduledTasks = await getRescheduledTasksByTaskId(taskId);

    return res.json({
      message: "Rescheduled tasks retrieved successfully",
      rescheduledTasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific rescheduled task by ID
 */
export const getRescheduledTaskHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    if (!id) {
      return next(new BadUserInputError({ message: "Rescheduled task ID is required" }));
    }

    const rescheduledTask = await getRescheduledTaskById(id);

    // Verify that the rescheduled task belongs to the user
    if (rescheduledTask.task.schedule.userId !== userId) {
      return next(new BadUserInputError({ message: "Unauthorized access to rescheduled task" }));
    }

    return res.json({
      message: "Rescheduled task retrieved successfully",
      rescheduledTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a rescheduled task
 */
export const deleteRescheduledTaskHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    if (!id) {
      return next(new BadUserInputError({ message: "Rescheduled task ID is required" }));
    }

    // First get the rescheduled task to verify ownership
    const rescheduledTask = await getRescheduledTaskById(id);

    // Verify that the rescheduled task belongs to the user
    if (rescheduledTask.task.schedule.userId !== userId) {
      return next(new BadUserInputError({ message: "Unauthorized access to rescheduled task" }));
    }

    await deleteRescheduledTask(id);

    return res.json({
      message: "Rescheduled task deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a rescheduled task
 */
export const updateRescheduledTaskHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;

    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }

    if (!id) {
      return next(new BadUserInputError({ message: "Rescheduled task ID is required" }));
    }

    if (!newDate) {
      return next(new BadUserInputError({ message: "New date is required" }));
    }

    if (!newTime) {
      return next(new BadUserInputError({ message: "New time is required" }));
    }

    // First get the rescheduled task to verify ownership
    const rescheduledTask = await getRescheduledTaskById(id);

    // Verify that the rescheduled task belongs to the user
    if (rescheduledTask.task.schedule.userId !== userId) {
      return next(new BadUserInputError({ message: "Unauthorized access to rescheduled task" }));
    }

    const updatedRescheduledTask = await updateRescheduledTask(id, {
      rescheduledDate: newDate,
      rescheduledTime: newTime,
      reason: reason
    });

    return res.json({
      message: "Rescheduled task updated successfully",
      rescheduledTask: updatedRescheduledTask
    });
  } catch (error) {
    next(error);
  }
};
