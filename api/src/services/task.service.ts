import { PrismaClient, TaskStatus } from "@prisma/client";
import { BadUserInputError, EntityNotFoundError } from "../errors";
import { createRescheduledTask } from "./rescheduled-task.service";
import { format } from "date-fns";

const prisma = new PrismaClient();

/**
 * Function to reschedule a task
 * @param taskId - ID of the task to reschedule
 * @param userId - ID of the user making the request
 * @param newDate - New date for the task
 * @param newTime - New time for the task (format: "HH:MM")
 * @param reason - Reason for rescheduling
 * @returns The created RescheduledTask record
 */
export const rescheduleTask = async (
    taskId: string,
    userId: string,
    newDate: Date,
    newTime: string,
    reason?: string
) => {
    return await prisma.$transaction(async (tx) => {
        // Find the task and verify it belongs to the user
        const task = await tx.task.findFirst({
            where: {
                id: taskId,
                schedule: {
                    userId
                }
            },
            include: {
                schedule: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!task) {
            throw new EntityNotFoundError("Task not found or unauthorized");
        }

        // Create a RescheduledTask record
        const rescheduledTask = await tx.rescheduledTask.create({
            data: {
                taskId: task.id,
                originalTaskTime: task.time,
                rescheduledDate: newDate,
                rescheduledTime: newTime,
                reason: reason || null
            },
            include: {
                task: true
            }
        });

        // Update notifications if needed
        // We can create notifications for the rescheduled time if required
        // This would depend on your application's requirements

        return rescheduledTask;
    });
};

/**
 * Helper function to calculate notification time
 * @param taskTime - Task time (Date object or ISO string)
 * @param notifyBeforeMinutes - Minutes before task to send notification
 * @returns Date object for notification time
 */
const calculateNotificationTime = (taskTime: Date | string, notifyBeforeMinutes: number): Date => {
    const taskDate = new Date(taskTime);
    return new Date(taskDate.getTime() - (notifyBeforeMinutes * 60000));
};

export const createTask = async (
    name: string,
    time: string,
    duration: number,
    scheduleId: string,
    notificationSettings?: {
        isEmailEnabled?: boolean;
        isWhatsAppEnabled?: boolean;
        isTelegramEnabled?: boolean;
        isCallEnabled?: boolean;
    }
) => {
    return await prisma.$transaction(async (tx) => {
        // Get user's default notification settings
        const schedule = await tx.schedule.findUnique({
            where: { id: scheduleId },
            include: { user: true }
        });

        if (!schedule) {
            throw new Error('Schedule not found');
        }

        // Create the task with notification settings
        const task = await tx.task.create({
            data: {
                name,
                time,
                duration,
                scheduleId,
                // Use provided settings (with explicit boolean conversion) or fall back to user defaults
                isEmailEnabled: notificationSettings?.isEmailEnabled ?? schedule.user.isEmailEnabled,
                isWhatsAppEnabled: notificationSettings?.isWhatsAppEnabled ?? schedule.user.isWhatsAppEnabled,
                isTelegramEnabled: notificationSettings?.isTelegramEnabled ?? schedule.user.isTelegramEnabled,
                isCallEnabled: notificationSettings?.isCallEnabled ?? schedule.user.isCallEnabled,
            },
            include: {
                schedule: {
                    include: {
                        user: true
                    }
                }
            }
        });

        // Create notifications based on task-specific settings
        const notifyAt = calculateNotificationTime(time, schedule.user.notifyBeforeMinutes);
        const notifications = [];

        // Only create notifications if explicitly enabled in task settings
        if (task.isEmailEnabled && schedule.user.email) {
            notifications.push({
                taskId: task.id,
                userId: schedule.user.id,
                channel: 'email',
                notifyAt
            });
        }

        if (task.isWhatsAppEnabled && schedule.user.phoneNumber) {
            notifications.push({
                taskId: task.id,
                userId: schedule.user.id,
                channel: 'whatsapp',
                notifyAt
            });
        }

        if (task.isTelegramEnabled && schedule.user.telegramChatId) {
            notifications.push({
                taskId: task.id,
                userId: schedule.user.id,
                channel: 'telegram',
                notifyAt
            });
        }

        if (task.isCallEnabled && schedule.user.phoneNumber) {
            notifications.push({
                taskId: task.id,
                userId: schedule.user.id,
                channel: 'call',
                notifyAt
            });
        }

        if (notifications.length > 0) {
            await tx.taskNotification.createMany({
                data: notifications
            });
        }

        return task;
    });
};


