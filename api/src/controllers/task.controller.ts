import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { rescheduleTask } from "../services/task.service";
import { BadUserInputError } from "../errors";
import { AuthenticatedRequest } from "../types/request";

const prisma = new PrismaClient();

/**
 * Reschedule a task to a new time
 */
export const rescheduleTaskHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { taskId } = req.params;
        const { newTime, reason, keepOriginal } = req.body;

        if (!userId) {
            return next(new BadUserInputError({ message: "User ID is missing from request" }));
        }

        if (!taskId || !newTime) {
            return next(new BadUserInputError({ message: "Task ID and new time are required" }));
        }

        const rescheduledTask = await rescheduleTask(
            taskId,
            userId,
            new Date(newTime),
            reason,
            keepOriginal !== false // Default to true if not explicitly set to false
        );

        return res.json({
            message: "Task rescheduled successfully",
            task: rescheduledTask
        });
    } catch (error) {
        next(error);
    }
};

export const updateTaskNotificationSettings = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const {
            isEmailEnabled,
            isWhatsAppEnabled,
            isTelegramEnabled,
            isCallEnabled
        } = req.body;

        // Update task notification settings
        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                isEmailEnabled,
                isWhatsAppEnabled,
                isTelegramEnabled,
                isCallEnabled
            },
        });

        // Update existing notifications
        await prisma.taskNotification.deleteMany({
            where: { taskId: task.id }
        });

        // Get user details
        const user = await prisma.user.findFirst({
            where: {
                schedules: {
                    some: {
                        originalData: {
                            some: {
                                id: taskId
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Create new notifications based on updated settings
        const notifications = [];
        const notifyAt = new Date(); // Calculate proper notification time

        if (isEmailEnabled && task.isEmailEnabled && user.email) {
            notifications.push({
                taskId: task.id,
                userId: user.id,
                channel: 'email',
                notifyAt
            });
        }

        // Add other notification types...

        if (notifications.length > 0) {
            await prisma.taskNotification.createMany({
                data: notifications
            });
        }

        return res.json({ message: "Task notification settings updated", task });
    } catch (error) {
        return res.status(500).json({ error: "Error updating task notification settings" });
    }
};