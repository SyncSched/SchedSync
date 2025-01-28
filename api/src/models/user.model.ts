import { Schedule } from "./schedule.model";

export interface User {
    id?: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    googleId: string | null;
    schedules?: Schedule[];
    createdAt: Date;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'schedules'>;
export type UserWithoutSchedules = Omit<User, 'schedules'>;