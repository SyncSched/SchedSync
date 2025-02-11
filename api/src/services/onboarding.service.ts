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
  sleepingStart: string;
  sleepingEnd: string;
  workingHours: number;
  workingStart: string;
  workingEnd: string;
}

export const createOnboardingData = async (data: OnboardingData): Promise<boolean> => {
  try {
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
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        onboardingData: {
          create: {
            profession: data.profession,
            hobbies: data.hobbies,
            sleepingHours: data.sleepingHours,
            sleepingStart: data.sleepingStart,
            sleepingEnd: data.sleepingEnd,
            workingHours: data.workingHours,
            workingStart: data.workingStart,
            workingEnd: data.workingEnd,
          },
        },
      },
    });

    return true; // Indicate success
  } catch (error) {
    console.error("Error creating onboarding data:", error);
    return false; // Indicate failure
  }
};
