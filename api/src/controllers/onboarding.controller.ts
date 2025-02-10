import { Request, Response } from "express";
import { checkUserOnboarding } from "../services/onboarding.service";

export const checkOnboardingDataHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Get user ID from request params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const hasOnboardingData = await checkUserOnboarding(userId);

    return res.status(200).json({ hasOnboardingData });
  } catch (error) {
    console.error("Error checking onboarding data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
