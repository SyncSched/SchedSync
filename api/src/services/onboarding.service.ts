import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkUserOnboarding = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingData: true } // Only fetch onboardingData field
  });

  return user?.onboardingData ? true : false;
};

interface OnboardingData {
  userId: string;
  profession: string;
  hobbies: string[];
  sleepingHours: number;
  sleepingStart: Date;
  sleepingEnd: Date;
  workingHours: number;
  workingStart: Date;
  workingEnd: Date;
}

export const getOnboardingData = async (userId: string): Promise<OnboardingData | null> => {
  try {
    const onboardingData = await prisma.onboardingData.findUnique({
      where: { userId },
    });

    return onboardingData ? { ...onboardingData, userId } : null;
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return null; // Return null in case of errors
  }
};

export const createOnboardingData = async (data: OnboardingData): Promise<boolean> => {
  try {
    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userExists) {
      console.error(`User with ID ${data.userId} does not exist`);
      return false; // Indicate failure because user does not exist
    }

    // Check if onboarding data already exists for the user
    const existingOnboardingData = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { onboardingData: true },
    });

    if (existingOnboardingData?.onboardingData) {
      console.warn(`Onboarding data already exists for user ${data.userId}`);
      return false; // Indicate that data was not created because it already exists
    }

    // Create the onboarding data
    await prisma.onboardingData.create({
      data: {
        userId: data.userId,
        profession: data.profession,
        hobbies: data.hobbies,
        sleepingHours: data.sleepingHours,
        sleepingStart: data.sleepingStart,
        sleepingEnd: data.sleepingEnd,
        workingHours: data.workingHours,
        workingStart: data.workingStart,
        workingEnd: data.workingEnd,
      },
    });

    return true; // Indicate success
  } catch (error) {
    console.error("Error creating onboarding data:", error);
    return false; // Indicate failure
  }
};
