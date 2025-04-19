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
        throw new Error("User not found or missing email");
      }
    
      // Fetch task details using the IDs
      const tasks = await prisma.task.findMany({
        where: {
          id: { in: taskIds },
        },
        select: {
          name: true,
          time: true,
          duration: true,
          location: true,
        },
      });
    
      // Format message
      const messageLines = tasks.map((task, idx) => {
        return `${idx + 1}. ${task.name} \n   Time: ${new Date(task.time).toLocaleString()} \n   Duration: ${task.duration} min \n   Location: ${task.location}\n`;
      });
    
      const message = `📌 You have tasks nearby:\n\n${messageLines.join('\n')}`;
    
      // Send email
      return await sendEmail(user.email, "Nearby Task Reminder", message);
  };