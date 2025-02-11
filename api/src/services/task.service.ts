import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTask = async (
    name: string,
    time: string,
    duration: number,
    scheduleId: string
) => {
    return prisma.task.create({
        data: {
            name,
            time,
            duration,
            scheduleId,
        },
    });
};
