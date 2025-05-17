import { User } from "./user.model";

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalInput {
  title: string;
  userId: string;
}

export interface UpdateGoalInput {
  title?: string;
  isCompleted?: boolean;
}
