// 1. Define input type
// export type CreateScheduleInput = Prisma.ScheduleCreateInput;
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { CreateScheduleInput , Task , Schedule } from '../models/schedule.model';
import { createScheduleSchema } from '../validations/schedule.schema';
// 2. Define return type
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: { user: true ;originalData:true };
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
    include: { user: true, originalData: true }, // Ensure tasks are fetched
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

  const updatedSchedule = {...schedule,originalData : schedule.originalData};
  return updatedSchedule;
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
    include: { user: true, originalData: true }
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
