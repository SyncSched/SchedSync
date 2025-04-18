import { User } from "./user.model";
import { TaskStatus as PrismaTaskStatus, Priority as PrismaPriority } from '@prisma/client';

// Update enums to match Prisma's types
export type TaskStatus = PrismaTaskStatus;
export type Priority = PrismaPriority;

// Basic task structure
export interface Task {
    id: string;
    name: string;
    description: string | null;
    notes: string | null;
    time: Date;
    duration: number;
    status: TaskStatus;
    priority: Priority;
    location: string | null;
    scheduleId: string;

    // Notification preferences
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}


  // For Prisma Schema interfaces
  export interface Schedule {
    id: string;
    userId: string;
    status: string;
    originalData: Task[];
    user: User;
    createdAt: Date;
    updatedAt: Date;
  }

  // Input types for creating/updating
  export interface CreateScheduleInput {
    userId: string;
    originalData: {
        name: string;
        description?: string | null;
        notes?: string | null;
        time: string | Date; // Can be either string (HH:mm) or Date object
        duration: number;
        status?: TaskStatus;
        priority?: Priority;
        location?: string | null;
        isEmailEnabled?: boolean;
        isWhatsAppEnabled?: boolean;
        isTelegramEnabled?: boolean;
        isCallEnabled?: boolean;
    }[];
  }

  export type UpdateScheduleInput = Partial<CreateScheduleInput>;

  // Task input types
  export type CreateTaskInput = Omit<Task, 'id'>;
  export type UpdateTaskInput = Partial<CreateTaskInput>;

  // Utility type to represent a schedule without relations
  export type ScheduleWithoutRelations = Omit<Schedule, 'user'>;
