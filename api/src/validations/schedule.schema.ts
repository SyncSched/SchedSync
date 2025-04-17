import { z } from "zod";

// Define validation schema for originalData array
const originalDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Accept either a string in HH:mm format or a Date object
  time: z.union([
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"),
    z.date()
  ]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  isEmailEnabled: z.boolean().optional(),
  isWhatsAppEnabled: z.boolean().optional(),
  isTelegramEnabled: z.boolean().optional(),
  isCallEnabled: z.boolean().optional()
});

// Define the full validation schema for schedule creation
export const createScheduleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  originalData: z.array(originalDataSchema).min(1, "At least one task is required"),
});

// TypeScript type inference
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
