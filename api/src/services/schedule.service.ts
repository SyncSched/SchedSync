import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

// 1. Define input type
export type CreateScheduleInput = Prisma.ScheduleCreateInput;

// 2. Define return type
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: { user: true; adjustments: true };
}>;

const prisma = new PrismaClient();

// 3. Update service function
export const createSchedule = async (
  data: Prisma.ScheduleCreateInput,
  userId: string
): Promise<ScheduleWithRelations> => {
  return prisma.schedule.create({
    data: {
      ...data,
      user: { connect: { id: userId } }, // Explicit relation connection
    },
    include: { user: true, adjustments: true }
  });
};