import { User } from "./user.model";
import { Adjustment } from "./adjustment.model";

// Basic task structure
export interface Task {
    id: string;
    name: string;
    time: string;    // Time in "HH:MM" format
    duration: number; // Duration in minutes
  }
  
  // Original schedule data structure
  export interface ScheduleData {
    tasks: Task[];
  }
  
  // For Prisma Schema interfaces
  export interface Schedule {
    id: string;
    userId: string;
    user: User;
    originalData?: ScheduleData;
    adjustments?: Adjustment[];
    createdAt: Date;
  }
  
  // Input types for creating/updating
  export type CreateScheduleInput = Omit<Schedule, 'id' | 'createdAt' | 'adjustments'>  & {
    originalData: any; // Use proper type for your JSON data
  };
  export type UpdateScheduleInput = Partial<CreateScheduleInput>;
  
  // Task input types
  export type CreateTaskInput = Omit<Task, 'id'>;
  export type UpdateTaskInput = Partial<CreateTaskInput>;
  
  // Utility type to represent a schedule without relations
  export type ScheduleWithoutRelations = Omit<Schedule, 'user' | 'adjustments'>;