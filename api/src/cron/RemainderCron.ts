import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/email";
import cron from 'node-cron';

const prisma = new PrismaClient();

// Add interfaces for different notification services
interface NotificationService {
  send(to: string, subject: string, message: string): Promise<boolean>;
}

// Implement each notification service
class EmailNotifier implements NotificationService {
  async send(to: string, subject: string, message: string): Promise<boolean> {
    return sendEmail(to, subject, message);
  }
}

class WhatsAppNotifier implements NotificationService {
  async send(to: string, _subject: string, message: string): Promise<boolean> {
    // TODO: Implement WhatsApp notification
    console.log(`WhatsApp notification to ${to}: ${message}`);
    return true;
  }
}

class TelegramNotifier implements NotificationService {
  async send(to: string, _subject: string, message: string): Promise<boolean> {
    // TODO: Implement Telegram notification
    console.log(`Telegram notification to ${to}: ${message}`);
    return true;
  }
}

class CallNotifier implements NotificationService {
  async send(to: string, _subject: string, message: string): Promise<boolean> {
    // TODO: Implement Call notification
    console.log(`Call notification to ${to}: ${message}`);
    return true;
  }
}

// Notification service factory
const notificationServices: Record<string, NotificationService> = {
  email: new EmailNotifier(),
  whatsapp: new WhatsAppNotifier(),
  telegram: new TelegramNotifier(),
  call: new CallNotifier()
};

export async function processNotifications() {
  const now = new Date();

  try {
    const notifications = await prisma.taskNotification.findMany({
      where: {
        status: "pending",
        notifyAt: {
          lte: now // Only get notifications that should be sent by now
        }
      },
      include: { 
        user: true, 
        task: true 
      }
    });

    for (const notification of notifications) {
      const { user, task, channel } = notification;

      // Skip if the channel is disabled for the user
      if (!isChannelEnabled(user, channel)) {
        continue;
      }

      // Get the appropriate notification service
      const notifier = notificationServices[channel.toLowerCase()];
      if (!notifier) {
        console.error(`Unknown notification channel: ${channel}`);
        continue;
      }

      // Prepare notification content
      const subject = `Reminder: ${task.name}`;
      const message = formatMessage(task, channel);

      // Get the appropriate recipient address based on channel
      const recipient = getRecipientAddress(user, channel);
      if (!recipient) {
        console.error(`No ${channel} address found for user ${user.id}`);
        continue;
      }

      try {
        const sent = await notifier.send(recipient, subject, message);
        if (sent) {
          await prisma.taskNotification.update({
            where: { id: notification.id },
            data: { status: "sent" }
          });
        } else {
          await prisma.taskNotification.update({
            where: { id: notification.id },
            data: { status: "failed" }
          });
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        await prisma.taskNotification.update({
          where: { id: notification.id },
          data: { status: "failed" }
        });
      }
    }

    return { success: true, message: "Notifications processed successfully" };
  } catch (error) {
    console.error("Error processing notifications:", error);
    return { success: false, message: "Error processing notifications" };
  }
}

// Helper functions
function isChannelEnabled(user: any, channel: string): boolean {
  const channelMap: Record<string, string> = {
    email: 'isEmailEnabled',
    whatsapp: 'isWhatsAppEnabled',
    telegram: 'isTelegramEnabled',
    call: 'isCallEnabled'
  };
  return user[channelMap[channel.toLowerCase()]] || false;
}

function getRecipientAddress(user: any, channel: string): string | null {
  const addressMap: Record<string, string> = {
    email: 'email',
    whatsapp: 'phoneNumber',
    telegram: 'telegramChatId',
    call: 'phoneNumber'
  };
  return user[addressMap[channel.toLowerCase()]] || null;
}

function formatMessage(task: any, channel: string): string {
  const baseMessage = `Your task "${task.name}" is scheduled at ${task.time}`;
  
  switch (channel.toLowerCase()) {
    case 'email':
      return `${baseMessage}\n\nThis is an automated reminder from your schedule assistant.`;
    case 'whatsapp':
      return `📅 ${baseMessage}`;
    case 'telegram':
      return `🔔 ${baseMessage}`;
    case 'call':
      return baseMessage;
    default:
      return baseMessage;
  }
}

// Initialize cron job to run every minute
export const initNotificationCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running notification check...');
    await processNotifications();
  });
};