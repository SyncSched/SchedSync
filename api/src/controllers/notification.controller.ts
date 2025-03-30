import { Request, Response } from "express";
import { AuthenticatedRequest } from '../types/request';
import { PrismaClient } from "@prisma/client";
import { 
    getUpcomingNotifications, 
    updateNotificationTime, 
    deleteNotification 
} from '../services/notification.service'

const prisma = new PrismaClient();

export const updateRemainderSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isEmailEnabled, isWhatsAppEnabled, isTelegramEnabled, isCallEnabled } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isEmailEnabled, isWhatsAppEnabled, isTelegramEnabled, isCallEnabled },
    });

    return res.json({ message: "Remainder settings updated", user });
  } catch (error) {
    return res.status(500).json({ error: "Error updating Remainder settings" });
  }
};

export const getUpcomingNotificationsHandler = async (
    req: AuthenticatedRequest, 
    res: Response
) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const notifications = await getUpcomingNotifications(userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch upcoming notifications" });
    }
};

export const updateNotificationTimeHandler = async (
    req: AuthenticatedRequest, 
    res: Response
) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;
        const { notifyAt } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!notifyAt) {
            return res.status(400).json({ error: 'New notification time is required' });
        }

        const updatedNotification = await updateNotificationTime(
            notificationId,
            userId,
            new Date(notifyAt)
        );

        res.json(updatedNotification);
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification time" });
    }
};

export const deleteNotificationHandler = async (
    req: AuthenticatedRequest, 
    res: Response
) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await deleteNotification(notificationId, userId);
        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
};
