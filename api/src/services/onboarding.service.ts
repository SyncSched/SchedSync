import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkUserOnboarding = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingData: true } // Only fetch onboardingData field
  });

  return user?.onboardingData ? true : false;
};
