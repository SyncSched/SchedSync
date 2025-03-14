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
  console.log('[NOTIFICATION_PROCESSOR] Starting notification processing job');
  console.log('[NOTIFICATION_PROCESSOR] Current timestamp:', new Date().toISOString());

  const now = new Date();
  console.log('[NOTIFICATION_PROCESSOR] Processing notifications due before:', now.toISOString());

  try {
    const notifications = await prisma.taskNotification.findMany({
      where: {
        status: "pending",
        notifyAt: {
          lte: now
        }
      },
      include: { 
        user: true, 
        task: true 
      }
    });

    console.log('[NOTIFICATION_PROCESSOR] Found pending notifications:', notifications.length);

    for (const notification of notifications) {
      const { user, task, channel } = notification;
      console.log('[NOTIFICATION_PROCESSOR] Processing notification:', {
        notificationId: notification.id,
        userId: user.id,
        taskId: task.id,
        channel,
        scheduledFor: notification.notifyAt
      });

      // Channel-specific validation logs
      switch (channel.toLowerCase()) {
        case 'email':
          console.log('[NOTIFICATION_PROCESSOR] Email validation:', {
            userId: user.id,
            emailEnabled: user.isEmailEnabled,
            taskEmailEnabled: task.isEmailEnabled,
            hasEmail: !!user.email
          });
          if (!user.isEmailEnabled || !task.isEmailEnabled || !user.email) {
            console.log('[NOTIFICATION_PROCESSOR] Skipping email notification - disabled or missing email');
            continue;
          }
          break;
        case 'whatsapp':
          if (!user.isWhatsAppEnabled || !task.isWhatsAppEnabled || !user.phoneNumber) {
            console.log(`WhatsApp notifications disabled for user ${user.id} or task ${task.id}`);
            continue;
          }
          break;
        case 'telegram':
          if (!user.isTelegramEnabled || !task.isTelegramEnabled || !user.telegramChatId) {
            console.log(`Telegram notifications disabled for user ${user.id} or task ${task.id}`);
            continue;
          }
          break;
        case 'call':
          if (!user.isCallEnabled || !task.isCallEnabled || !user.phoneNumber) {
            console.log(`Call notifications disabled for user ${user.id} or task ${task.id}`);
            continue;
          }
          break;
        default:
          console.error(`Unknown notification channel: ${channel}`);
          continue;
      }

      const notifier = notificationServices[channel.toLowerCase()];
      if (!notifier) {
        console.error('[NOTIFICATION_PROCESSOR] Invalid channel configuration:', {
          channel,
          notificationId: notification.id
        });
        continue;
      }

      const subject = `Reminder: ${task.name}`;
      const message = formatMessage(task, channel);
      const recipient = getRecipientAddress(user, channel);

      console.log('[NOTIFICATION_PROCESSOR] Attempting to send notification:', {
        channel,
        recipient: recipient ? 'valid' : 'missing',
        taskName: task.name
      });

      if (!recipient) {
        console.error('[NOTIFICATION_PROCESSOR] Missing recipient address:', {
          userId: user.id,
          channel,
          notificationId: notification.id
        });
        continue;
      }

      try {
        const sent = await notifier.send(recipient, subject, message);
        console.log('[NOTIFICATION_PROCESSOR] Notification delivery status:', {
          notificationId: notification.id,
          status: sent ? 'sent' : 'failed',
          channel,
          timestamp: new Date().toISOString()
        });

        await prisma.taskNotification.update({
          where: { id: notification.id },
          data: { status: sent ? "sent" : "failed" }
        });
      } catch (error) {
        console.error('[NOTIFICATION_PROCESSOR] Notification delivery failed:', {
          notificationId: notification.id,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });

        await prisma.taskNotification.update({
          where: { id: notification.id },
          data: { status: "failed" }
        });
      }
    }

    console.log('[NOTIFICATION_PROCESSOR] Completed processing notifications:', {
      totalProcessed: notifications.length,
      timestamp: new Date().toISOString()
    });

    return { success: true, message: "Notifications processed successfully" };
  } catch (error) {
    console.error('[NOTIFICATION_PROCESSOR] Critical error in notification processing:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
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
