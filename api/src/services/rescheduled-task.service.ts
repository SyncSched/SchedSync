import { PrismaClient } from "@prisma/client";
import { EntityNotFoundError } from "../errors";
import { CreateRescheduledTaskInput } from "../models/rescheduled-task.model";

const prisma = new PrismaClient();

/**
 * Create a new rescheduled task record
 * @param data - The data for the rescheduled task
 * @returns The created rescheduled task
 */
export const createRescheduledTask = async (data: CreateRescheduledTaskInput) => {
  // Ensure originalTaskTime and rescheduledDate are proper Date objects
  const originalTaskTime = data.originalTaskTime instanceof Date
    ? data.originalTaskTime
    : new Date(data.originalTaskTime);

  const rescheduledDate = data.rescheduledDate instanceof Date
    ? data.rescheduledDate
    : new Date(data.rescheduledDate);

  return await prisma.rescheduledTask.create({
    data: {
      taskId: data.taskId,
      originalTaskTime: originalTaskTime,
      rescheduledDate: rescheduledDate,
      rescheduledTime: data.rescheduledTime,
      reason: data.reason,
      rescheduledToTaskId: data.rescheduledToTaskId
    },
    include: {
      task: true
    }
  });
};

/**
 * Get all rescheduled tasks for a specific task
 * @param taskId - The ID of the task
 * @returns Array of rescheduled task records
 */
export const getRescheduledTasksByTaskId = async (taskId: string) => {
  return await prisma.rescheduledTask.findMany({
    where: {
      taskId
    },
    include: {
      task: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * Get all rescheduled tasks for a user
 * @param userId - The ID of the user
 * @returns Array of rescheduled task records
 */
export const getRescheduledTasksByUserId = async (userId: string) => {
  return await prisma.rescheduledTask.findMany({
    where: {
      task: {
        schedule: {
          userId
        }
      }
    },
    include: {
      task: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * Get all rescheduled tasks for a specific date
 * @param userId - The ID of the user
 * @param date - The date to check for rescheduled tasks
 * @returns Array of rescheduled task records for the specified date
 */
export const getRescheduledTasksForDate = async (userId: string, date: Date) => {
  // Create date range for the specified date (start of day to end of day)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.rescheduledTask.findMany({
    where: {
      task: {
        schedule: {
          userId
        }
      },
      rescheduledDate: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      task: true
    },
    orderBy: {
      rescheduledTime: 'asc' // Order by rescheduled time
    }
  });
};

/**
 * Get a specific rescheduled task by ID
 * @param id - The ID of the rescheduled task
 * @returns The rescheduled task or null if not found
 */
export const getRescheduledTaskById = async (id: string) => {
  const rescheduledTask = await prisma.rescheduledTask.findUnique({
    where: { id },
    include: {
      task: {
        include: {
          schedule: true
        }
      }
    }
  });

  if (!rescheduledTask) {
    throw new EntityNotFoundError("Rescheduled task not found");
  }

  return rescheduledTask;
};

/**
 * Delete a rescheduled task
 * @param id - The ID of the rescheduled task to delete
 * @returns The deleted rescheduled task
 */
export const deleteRescheduledTask = async (id: string) => {
  const rescheduledTask = await prisma.rescheduledTask.findUnique({
    where: { id }
  });

  if (!rescheduledTask) {
    throw new EntityNotFoundError("Rescheduled task not found");
  }

  return await prisma.rescheduledTask.delete({
    where: { id }
  });
};

/**
 * Update a rescheduled task
 * @param id - The ID of the rescheduled task to update
 * @param data - The updated data for the rescheduled task
 * @returns The updated rescheduled task
 */
export const updateRescheduledTask = async (
  id: string,
  data: {
    rescheduledDate?: string;
    rescheduledTime?: string;
    reason?: string | null;
  }
) => {
  const rescheduledTask = await prisma.rescheduledTask.findUnique({
    where: { id }
  });

  if (!rescheduledTask) {
    throw new EntityNotFoundError("Rescheduled task not found");
  }

  // Convert date string to DateTime object if provided
  const updateData: any = {};

  if (data.rescheduledDate) {
    // Ensure the date is in ISO-8601 format by creating a proper DateTime object
    updateData.rescheduledDate = new Date(data.rescheduledDate);
  }

  if (data.rescheduledTime !== undefined) {
    updateData.rescheduledTime = data.rescheduledTime;
  }

  if (data.reason !== undefined) {
    updateData.reason = data.reason;
  }

  return await prisma.rescheduledTask.update({
    where: { id },
    data: updateData,
    include: {
      task: {
        include: {
          schedule: true
        }
      }
    }
  });
};
