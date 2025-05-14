import { PrismaClient, TaskStatus } from "@prisma/client";
import { BadUserInputError, EntityNotFoundError } from "../errors";

const prisma = new PrismaClient();

/**
 * Function to reschedule a task
 * @param taskId - ID of the task to reschedule
 * @param userId - ID of the user making the request
 * @param newTime - New time for the task
 * @param reason - Reason for rescheduling
 * @param keepOriginal - Whether to keep the original task (mark as rescheduled) or update it directly
 * @returns The rescheduled task
 */
export const rescheduleTask = async (
    taskId: string,
    userId: string,
    newTime: Date,
    reason?: string,
    keepOriginal: boolean = true
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

        if (keepOriginal) {
            // Create a new task as a copy of the original with the new time
            const newTask = await tx.task.create({
                data: {
                    name: task.name,
                    description: task.description,
                    notes: task.notes,
                    time: newTime,
                    duration: task.duration,
                    status: TaskStatus.PENDING,
                    priority: task.priority,
                    location: task.location,
                    scheduleId: task.scheduleId,
                    isEmailEnabled: task.isEmailEnabled,
                    isWhatsAppEnabled: task.isWhatsAppEnabled,
                    isTelegramEnabled: task.isTelegramEnabled,
                    isCallEnabled: task.isCallEnabled,
                    rescheduledFromTaskId: task.id,
                    rescheduledReason: reason,
                    rescheduledAt: new Date()
                },
                include: {
                    schedule: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            // Update the original task to reference the new task
            await tx.task.update({
                where: { id: task.id },
                data: {
                    rescheduledToTaskId: newTask.id,
                    rescheduledReason: reason,
                    rescheduledAt: new Date()
                }
            });

            // Create notifications for the new task
            const notifyAt = calculateNotificationTime(newTime.toISOString(), task.schedule.user.notifyBeforeMinutes);
            const notifications = [];

            // Only create notifications if explicitly enabled in task settings
            if (newTask.isEmailEnabled && task.schedule.user.email) {
                notifications.push({
                    taskId: newTask.id,
                    userId: task.schedule.user.id,
                    channel: 'email',
                    notifyAt
                });
            }

            if (newTask.isWhatsAppEnabled && task.schedule.user.phoneNumber) {
                notifications.push({
                    taskId: newTask.id,
                    userId: task.schedule.user.id,
                    channel: 'whatsapp',
                    notifyAt
                });
            }

            if (newTask.isTelegramEnabled && task.schedule.user.telegramChatId) {
                notifications.push({
                    taskId: newTask.id,
                    userId: task.schedule.user.id,
                    channel: 'telegram',
                    notifyAt
                });
            }

            if (newTask.isCallEnabled && task.schedule.user.phoneNumber) {
                notifications.push({
                    taskId: newTask.id,
                    userId: task.schedule.user.id,
                    channel: 'call',
                    notifyAt
                });
            }

            if (notifications.length > 0) {
                await tx.taskNotification.createMany({
                    data: notifications
                });
            }

            return newTask;
        } else {
            // Update the existing task with the new time
            const updatedTask = await tx.task.update({
                where: { id: task.id },
                data: {
                    time: newTime,
                    rescheduledReason: reason,
                    rescheduledAt: new Date()
                },
                include: {
                    schedule: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            // Update notifications for the task
            await tx.taskNotification.deleteMany({
                where: { taskId: task.id }
            });

            // Create new notifications
            const notifyAt = calculateNotificationTime(newTime.toISOString(), task.schedule.user.notifyBeforeMinutes);
            const notifications = [];

            if (updatedTask.isEmailEnabled && task.schedule.user.email) {
                notifications.push({
                    taskId: updatedTask.id,
                    userId: task.schedule.user.id,
                    channel: 'email',
                    notifyAt
                });
            }

            if (updatedTask.isWhatsAppEnabled && task.schedule.user.phoneNumber) {
                notifications.push({
                    taskId: updatedTask.id,
                    userId: task.schedule.user.id,
                    channel: 'whatsapp',
                    notifyAt
                });
            }

            if (updatedTask.isTelegramEnabled && task.schedule.user.telegramChatId) {
                notifications.push({
                    taskId: updatedTask.id,
                    userId: task.schedule.user.id,
                    channel: 'telegram',
                    notifyAt
                });
            }

            if (updatedTask.isCallEnabled && task.schedule.user.phoneNumber) {
                notifications.push({
                    taskId: updatedTask.id,
                    userId: task.schedule.user.id,
                    channel: 'call',
                    notifyAt
                });
            }

            if (notifications.length > 0) {
                await tx.taskNotification.createMany({
                    data: notifications
                });
            }

            return updatedTask;
        }
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


