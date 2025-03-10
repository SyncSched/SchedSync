import { User } from "./user.model";

// Basic task structure
export interface Task {
    id: string;
    name: string;
    time: string;    // Time in "HH:MM" format
    duration: number; // Duration in minutes
    scheduleId: string;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
}
  
  
  // For Prisma Schema interfaces
  export interface Schedule {
    id: string;
    userId: string;
    user: User;
    originalData: Task[];
    createdAt: Date;
  }
  
  // Input types for creating/updating
  export type CreateScheduleInput = Omit<Schedule, 'id' | 'createdAt' | 'user'> 


  export type UpdateScheduleInput = Partial<CreateScheduleInput>;
  
  // Task input types
  export type CreateTaskInput = Omit<Task, 'id'>;
  export type UpdateTaskInput = Partial<CreateTaskInput>;
  
  // Utility type to represent a schedule without relations
  export type ScheduleWithoutRelations = Omit<Schedule, 'user'>;
