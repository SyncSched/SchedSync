import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { 
    isTimeAdjustment,
    isDurationAdjustment,
    isTaskAdded,
    isTaskRemoved,
    CreateAdjustmentInput
} from "../models/adjustment.model";

export type AdjustmentWithRelations = Prisma.AdjustmentGetPayload<{
    include: { schedule: true };
}>;

const prisma = new PrismaClient();

export const createAdjustment = async (
    input: CreateAdjustmentInput
): Promise<AdjustmentWithRelations> => {

    switch (input.change_type) {
        case 'time_adjustment':
            if (!isTimeAdjustment(input.details)) {
                throw new Error('Invalid time adjustment details');
            }
            break;
        case 'duration_adjustment':
            if (!isDurationAdjustment(input.details)) {
                throw new Error('Invalid duration adjustment details');
            }
            break;
        case 'task_added':
            if (!isTaskAdded(input.details)) {
                throw new Error('Invalid task added details');
            }
            break;
        case 'task_removed':
            if (!isTaskRemoved(input.details)) {
                throw new Error('Invalid task removed details');
            }
            break;
        default:
            throw new Error('Unknown change type');
    }


    const { scheduleId, task_id , change_type , details ,userId  } = input;

    return prisma.adjustment.create({
        data: {
            schedule: { connect: { id: scheduleId } },
            userId,
            task_id,
            change_type,
            details: details ? (details as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
        include: { schedule: true, },
    });
};
