import { User } from "./user.model";
import { Adjustment } from "./adjustment.model";

// Basic task structure
export interface Task {
    id: string;
    name: string;
    time: string;    // Time in "HH:MM" format
    duration: number; // Duration in minutes
    scheduleId:string;
  }
  
  
  // For Prisma Schema interfaces
  export interface Schedule {
    id: string;
    userId: string;
    user: User;
    originalData: Task[];
    adjustments: Adjustment[];
    createdAt: Date;
  }
  
  // Input types for creating/updating
  export type CreateScheduleInput = Omit<Schedule, 'id' | 'createdAt' | 'adjustments' | 'user'> 


  export type UpdateScheduleInput = Partial<CreateScheduleInput>;
  
  // Task input types
  export type CreateTaskInput = Omit<Task, 'id'>;
  export type UpdateTaskInput = Partial<CreateTaskInput>;
  
  // Utility type to represent a schedule without relations
  export type ScheduleWithoutRelations = Omit<Schedule, 'user' | 'adjustments'>;