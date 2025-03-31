
import { PrismaClient } from '@prisma/client';
import { CreateUserInput, User , UserSettings } from '../models/user.model';
import { BadUserInputError } from '../errors';

const prisma = new PrismaClient();

export const createUser = async (data: CreateUserInput): Promise<User | null> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    console.log('User already exists:', existingUser);
    return existingUser; 
  }

  return prisma.user.create({
    data,
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

export const updateUserTimezone = async (userId: string, timezone: string) => {
  if (!userId || !timezone) {
    throw new BadUserInputError({ message : 'User ID and timezone are required'});
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { timezone },
    select: {
      id: true,
      timezone: true
    }
  });
};

interface UpdateUserSettingsInput {
  timezone?: string;
  notificationPreferences?: {
    isEmailEnabled?: boolean;
    isWhatsAppEnabled?: boolean;
    isTelegramEnabled?: boolean;
    isCallEnabled?: boolean;
    notifyBeforeMinutes?: number;
    phoneNumber?: string | null;
    telegramChatId?: string | null;
  };
  onboardingData?: {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
    workingHours: number;
    workingStart: string;
    workingEnd: string;
  };
}

export const updateUserSettings = async (
  userId: string,
  data: UpdateUserSettingsInput
) => {
  if (!userId) {
    throw new BadUserInputError({ message: 'User ID is required' });
  }

  return await prisma.$transaction(async (tx) => {
    // Update user's basic settings and notification preferences
    const userUpdate = await tx.user.update({
      where: { id: userId },
      data: {
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.notificationPreferences && {
          isEmailEnabled: data.notificationPreferences.isEmailEnabled,
          isWhatsAppEnabled: data.notificationPreferences.isWhatsAppEnabled,
          isTelegramEnabled: data.notificationPreferences.isTelegramEnabled,
          isCallEnabled: data.notificationPreferences.isCallEnabled,
          notifyBeforeMinutes: data.notificationPreferences.notifyBeforeMinutes,
          phoneNumber: data.notificationPreferences.phoneNumber,
          telegramChatId: data.notificationPreferences.telegramChatId,
        }),
      },
      include: {
        onboardingData: true
      }
    });

    // Update onboarding data if provided
    if (data.onboardingData) {
      await tx.onboardingData.upsert({
        where: { userId },
        create: {
          userId,
          ...data.onboardingData
        },
        update: data.onboardingData
      });
    }

    // Fetch final user state with all relations
    return await tx.user.findUnique({
      where: { id: userId },
      include: {
        onboardingData: true
      }
    });
  });
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  if (!userId) {
    throw new BadUserInputError({ message: 'User ID is required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      timezone: true,
      isEmailEnabled: true,
      isWhatsAppEnabled: true,
      isTelegramEnabled: true,
      isCallEnabled: true,
      notifyBeforeMinutes: true,
      phoneNumber: true,
      telegramChatId: true,
      onboardingData: true
    }
  });

  if (!user) {
    return null;
  }

  return user;
};
