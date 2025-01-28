// import { PrismaClient } from "@prisma/client";
// import { Prisma } from "@prisma/client";
// import { Adjustment , CreateAdjustmentInput } from "../models/adjustment.model";
// import { 
//     isTimeAdjustment,
//     isDurationAdjustment,
//     isTaskAdded,
//     isTaskRemoved
//  } from "../models/adjustment.model";


// export type AdjustmentWithRelations = Prisma.AdjustmentGetPayload<{
//     include:{   schedule:true   };
// }>;



// const prisma = new PrismaClient();


// export const createAdjustment = async (
//     input : CreateAdjustmentInput
// ) : Promise<AdjustmentWithRelations> =>{

//     for(const deltaItem of input.delta.delta){
//         switch (deltaItem.change_type) {
//             case 'time_adjustment':
//               if (!isTimeAdjustment(deltaItem.details)) {
//                 throw new Error('Invalid time adjustment details');
//               }
//               break;
//             case 'duration_adjustment':
//               if (!isDurationAdjustment(deltaItem.details)) {
//                 throw new Error('Invalid duration adjustment details');
//               }
//               break;
//             case 'task_added':
//               if (!isTaskAdded(deltaItem.details)) {
//                 throw new Error('Invalid task added details');
//               }
//               break;
//             case 'task_removed':
//               if (!isTaskRemoved(deltaItem.details)) {
//                 throw new Error('Invalid task removed details');
//               }
//               break;
//             default:
//               throw new Error('Unknown change type');
//         }
//     }

//     return prisma.adjustment.create({
//         data:{
//             scheduleId:input.delta.schedule_id,
//             delta:input.delta,

//         }
//     });
// }


import { PrismaClient } from '@prisma/client';
import { Adjustment, CreateAdjustmentInput } from '../models/adjustment.model';
import { 
  isTimeAdjustment, 
  isDurationAdjustment,
  isTaskAdded,
  isTaskRemoved
} from '../models/adjustment.model';

const prisma = new PrismaClient();

export const createAdjustment = async (
  input: CreateAdjustmentInput
): Promise<Adjustment> => {
  // Validate delta items
  for (const deltaItem of input.delta.delta) {
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

  return prisma.adjustment.create({
    data: {
      scheduleId: input.delta.schedule_id,
      delta: input.delta,
      createdAt: new Date(),
    },
    include: {
      schedule: true,
    },
  });
};