import { z } from "zod";

// Define validation schema for originalData array
const originalDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
});

// Define the full validation schema for schedule creation
export const createScheduleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  originalData: z.array(originalDataSchema).min(1, "At least one task is required"),
});

// TypeScript type inference (Optional)
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
