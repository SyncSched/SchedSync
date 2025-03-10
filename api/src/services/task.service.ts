import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

function calculateNotificationTime(timeString: string, notifyBeforeMinutes: number): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const taskDateTime = new Date();
    taskDateTime.setHours(hours, minutes, 0, 0);
    return new Date(taskDateTime.getTime() - (notifyBeforeMinutes * 60000));
}
