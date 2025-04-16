import { PrismaClient } from "@prisma/client";
import { BadUserInputError } from '../errors';
import { sendEmail } from "../utils/email";

const prisma = new PrismaClient();

export const getUpcomingNotifications = async (userId: string) => {
    const now = new Date();
    return await prisma.taskNotification.findMany({
        where: {
            userId,
            status: "pending"
        },
        include: {
            task: {
                select: {
                    id: true,
                    name: true,
                    time: true,
                    duration: true
                }
            }
        },
        orderBy: {
            notifyAt: 'asc'
        }
    });
};

export const updateNotificationTime = async (
    notificationId: string,
    userId: string,
    newNotifyAt: Date
) => {
    // First verify the notification belongs to the user
    const notification = await prisma.taskNotification.findFirst({
        where: {
            id: notificationId,
            userId
        }
    });

    if (!notification) {
        throw new BadUserInputError({ 
            message: 'Notification not found or unauthorized' 
        });
    }

    return await prisma.taskNotification.update({
        where: {
            id: notificationId
        },
        data: {
            notifyAt: newNotifyAt
        },
        include: {
            task: {
                select: {
                    id: true,
                    name: true,
                    time: true,
                    duration: true
                }
            }
        }
    });
};

export const deleteNotification = async (
    notificationId: string,
    userId: string
) => {
    // First verify the notification belongs to the user
    const notification = await prisma.taskNotification.findFirst({
        where: {
            id: notificationId,
            userId
        }
    });

    if (!notification) {
        throw new BadUserInputError({ 
            message: 'Notification not found or unauthorized' 
        });
    }

    return await prisma.taskNotification.delete({
        where: {
            id: notificationId
        }
    });
};

export const sendLocationNotifications = async (userId: string, taskIds: string[]) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user || !user.email) {
      throw new Error('User not found or email is missing');
    }
  
    const toAddress = user.email;
  
    // Create a message listing all task IDs
    const message = `You have tasks nearby: ${taskIds.join(', ')}`;
  
    // Send the email
    return await sendEmail(toAddress, "Nearby Task Notification", message);
  };