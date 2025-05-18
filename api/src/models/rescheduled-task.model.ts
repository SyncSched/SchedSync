import { Task } from "./schedule.model";

export interface RescheduledTask {
  id: string;
  taskId: string;
  originalTaskTime: Date;
  rescheduledDate: Date;
  rescheduledTime: string;
  reason: string | null;
  rescheduledToTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  task?: Task;
}

export interface CreateRescheduledTaskInput {
  taskId: string;
  originalTaskTime: Date;
  rescheduledDate: Date;
  rescheduledTime: string;
  reason?: string | null;
  rescheduledToTaskId?: string | null;
}

export interface UpdateRescheduledTaskInput extends Partial<CreateRescheduledTaskInput> {}
