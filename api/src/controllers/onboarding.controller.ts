import { Request, Response } from "express";
import { checkUserOnboarding, createOnboardingData } from "../services/onboarding.service";
import { AuthenticatedRequest } from "../types/request";
// Define the authenticated request type inline


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

export const createOnboardingHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Get user ID from req.user
    const { profession, hobbies, sleepingHours, sleepingStart, sleepingEnd, workingHours, workingStart, workingEnd } = req.body;

    // Input validation
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!profession) {
      return res.status(400).json({ message: "Profession is required" });
    }
    if (!hobbies || !Array.isArray(hobbies)) {
      return res.status(400).json({ message: "Hobbies must be a non-empty array" });
    }
    if (!sleepingHours || typeof sleepingHours !== 'number') {
      return res.status(400).json({ message: "Sleeping hours must be a number" });
    }
    if (!sleepingStart) {
      return res.status(400).json({ message: "Sleeping start time is required" });
    }
    if (!sleepingEnd) {
      return res.status(400).json({ message: "Sleeping end time is required" });
    }
    if (!workingHours || typeof workingHours !== 'number') {
      return res.status(400).json({ message: "Working hours must be a number" });
    }
    if (!workingStart) {
      return res.status(400).json({ message: "Working start time is required" });
    }
    if (!workingEnd) {
      return res.status(400).json({ message: "Working end time is required" });
    }

    // Call the onboarding service to create the onboarding data
    const result = await createOnboardingData({
      userId,
      profession,
      hobbies,
      sleepingHours,
      sleepingStart,
      sleepingEnd,
      workingHours,
      workingStart,
      workingEnd,
    });

    if (result) {
      return res.status(201).json({ message: "Onboarding data created successfully" });
    } else {
      return res.status(500).json({ message: "Failed to create onboarding data" });
    }
  } catch (error) {
    console.error("Error creating onboarding data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
