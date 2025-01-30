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

    // Validate adjustment details before storing
    for (const deltaItem of input.delta as any) {
        switch (deltaItem.change_type) {
            case 'time_adjustment':
                if (!isTimeAdjustment(deltaItem.details)) {
                    throw new Error('Invalid time adjustment details');
                }
                break;
            case 'duration_adjustment':
                if (!isDurationAdjustment(deltaItem.details)) {
                    throw new Error('Invalid duration adjustment details');
                }
                break;
            case 'task_added':
                if (!isTaskAdded(deltaItem.details)) {
                    throw new Error('Invalid task added details');
                }
                break;
            case 'task_removed':
                if (!isTaskRemoved(deltaItem.details)) {
                    throw new Error('Invalid task removed details');
                }
                break;
            default:
                throw new Error('Unknown change type');
        }
    }

    const { scheduleId, ...adjustmentData } = input as any;

    return prisma.adjustment.create({
        data: {
            ...adjustmentData,
            schedule: { connect: { id: scheduleId } }
        },
        include: { schedule: true },
    });
};


