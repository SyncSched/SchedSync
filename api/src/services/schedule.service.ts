// 1. Define input type
// export type CreateScheduleInput = Prisma.ScheduleCreateInput;
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { CreateScheduleInput , Task , Schedule } from '../models/schedule.model';
import { createScheduleSchema } from '../validations/schedule.schema';
import { Adjustment, isDurationAdjustment, isTaskAdded, isTaskRemoved, isTimeAdjustment, parseDetails } from '../models/adjustment.model';
// 2. Define return type
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: { user: true; adjustments: true ;originalData:true };
}>;

const prisma = new PrismaClient();

// 3. Update service function
export const createSchedule = async (
  input: CreateScheduleInput
): Promise<ScheduleWithRelations> => {
  const { userId, originalData } = input;

  const parsedInput = createScheduleSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error(parsedInput.error);
    throw new Error(`Validation error: ${parsedInput.error.issues.map(issue => issue.message).join(", ")}`);
  }


  return prisma.schedule.create({
    data: {
      originalData: {
          create: originalData,  // Ensure correct mapping for nested objects 
      },
      user: { connect: { id: userId } },
    },
    include: { user: true, adjustments: true, originalData: true }, // Ensure tasks are fetched
  });
};



export const getSchedule = async (
  date: string,
  userId: string
): Promise<Partial<Schedule>> => {
  
  if (!date || isNaN(Date.parse(date))) {
    throw new Error("Invalid date format received");
  }

  const parsedDate = new Date(date);

  const startDate = new Date(parsedDate);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(parsedDate);
  endDate.setUTCHours(23, 59, 59, 999);

  const schedule = await prisma.schedule.findFirst({
    where: {
      userId: userId,
      createdAt: {
        gte: startDate, 
        lte: endDate,  
      },
    },
    include: {
      user: true,
      originalData: true,
    },
  });
  
  if (!schedule) {
    throw new Error("No Schedule found for today , so we are generating the Schedule for today");
  }

  let adjustments = await prisma.adjustment.findMany({
    where:{
      scheduleId:schedule.id,
    },
  })
  const parsedAdjustments = adjustments.map(adjustment =>({
    ...adjustment,
    details:parseDetails(adjustment.details)
  }))
  const newTasks = applyAdjustments(schedule.originalData,parsedAdjustments);

  const updatedSchedule = {...schedule,originalData : newTasks};
  return updatedSchedule;
};


const applyAdjustments = (tasks: Task[], adjustments: Adjustment[]): Task[] => {
  // Clone the original tasks to avoid mutation
  let updatedTasks: Task[] = tasks;

  adjustments.forEach(adjustment => {
    const { task_id, change_type, details ,scheduleId} = adjustment;
    const taskIndex = updatedTasks.findIndex(task => task.id === task_id);

    switch (change_type) {
      case "time_adjustment":
        if (taskIndex !== -1 && isTimeAdjustment(details)) {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], time: details.to_time };
        }
        break;

      case "duration_adjustment":
        if (taskIndex !== -1 && isDurationAdjustment(details)) {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], duration: details.to_duration };
        }
        break;

      case "task_added":
        if (isTaskAdded(details)) {
          updatedTasks.push({
            id: task_id, // Generate a unique ID
            name: details.name,
            time: details.time,
            duration: details.duration,
            scheduleId,
          });
        }
        break;

      case "task_removed":
        if (taskIndex !== -1 && isTaskRemoved(details)) {
          updatedTasks.splice(taskIndex, 1);
        }
        break;

      default:
        console.warn(`Unknown changeType: ${change_type}`);
    }
  });

  return  updatedTasks;
};

export const updateSchedule = async (
  scheduleId: string,
  data: { originalData: Task[] }
): Promise<ScheduleWithRelations> => {
  if (!scheduleId) {
    throw new Error('Schedule ID is required');
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  // Remove scheduleId from each task before creating
  const tasksWithoutScheduleId = data.originalData.map(({ scheduleId: _, ...task }) => task);

  return prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      originalData: {
        deleteMany: {},  // Delete existing tasks
        createMany: {    // Create new tasks
          data: tasksWithoutScheduleId
        }
      }
    },
    include: { user: true, adjustments: true, originalData: true }
  });
};


export const getTodaySchedules = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        user: true, // Include user information
        originalData: true, // Include tasks
        adjustments: true // Include adjustments to handle any modifications
      }
    });
    
    // Apply any adjustments to the schedules if needed
    const updatedSchedules = schedules.map(schedule => {
      // const parsedAdjustments = schedule.adjustments.map(adjustment => ({
      //   ...adjustment,
      //   details: parseDetails(adjustment.details)
      // }));
      
      // const updatedTasks = applyAdjustments(schedule.originalData, parsedAdjustments);
      return {
        ...schedule,
        // originalData: updatedTasks
      };
    });

    return updatedSchedules;
  } catch (error) {
    console.error('Error fetching today schedules:', error);
    throw error;
  }
};
