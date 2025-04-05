import { Schedule } from "./schedule.model";

export interface UserSettings {
  timezone: string;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
  notifyBeforeMinutes: number;
  phoneNumber?: string | null;
  telegramChatId?: string | null;
  onboardingData?: {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
    workingHours: number;
    workingStart: string;
    workingEnd: string;
  } | null;
}

export interface User {
    id?: string;
    email: string;
    name: string;
    avatarUrl: string;
    googleId: string;
    schedules?: Schedule[];
    createdAt: Date;
    settings?: UserSettings;
    weights?: number[];
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'schedules'>;
export type UserWithoutSchedules = Omit<User, 'schedules'>;
