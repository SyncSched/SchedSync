import { sendEmail } from "../utils/email";
import { sendTelegram } from "../utils/telegram";
import cron from 'node-cron';
import { prisma } from '../utils/prisma-client';

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
    return true;
  }
}

class TelegramNotifier implements NotificationService {
  async send(to: string, _subject: string, message: string): Promise<boolean> {
    return sendTelegram(to, message);
  }
}

class CallNotifier implements NotificationService {
  async send(to: string, _subject: string, message: string): Promise<boolean> {
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
  const nowUTC = new Date(now.toISOString());

  try {
    const notifications = await prisma.taskNotification.findMany({
      where: {
        status: "pending",
        notifyAt: {
          lte: nowUTC
        }
      },
      include: {
        user: true,
        task: true
      }
    });

    for (const notification of notifications) {
      const { user, task, channel } = notification;

      // Channel-specific validation
      switch (channel.toLowerCase()) {
        case 'email':
          if (!user.isEmailEnabled || !task.isEmailEnabled || !user.email) {
            continue;
          }
          break;
        case 'whatsapp':
          if (!user.isWhatsAppEnabled || !task.isWhatsAppEnabled || !user.phoneNumber) {
            continue;
          }
          break;
        case 'telegram':
          if (!user.isTelegramEnabled || !task.isTelegramEnabled || !user.telegramChatId) {
            continue;
          }
          break;
        case 'call':
          if (!user.isCallEnabled || !task.isCallEnabled || !user.phoneNumber) {
            continue;
          }
          break;
        default:
          continue;
      }

      const notifier = notificationServices[channel.toLowerCase()];
      if (!notifier) {
        continue;
      }

      const subject = `Reminder: ${task.name}`;
      const message = formatMessage(task, channel);
      const recipient = getRecipientAddress(user, channel);

      if (!recipient) {
        continue;
      }

      try {
        const sent = await notifier.send(recipient, subject, message);
        await prisma.taskNotification.update({
          where: { id: notification.id },
          data: { status: sent ? "sent" : "failed" }
        });
      } catch (error) {
        await prisma.taskNotification.update({
          where: { id: notification.id },
          data: { status: "failed" }
        });
      }
    }

    return { success: true, message: "Notifications processed successfully" };
  } catch (error) {
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
      return `<b>🔔 Task Reminder</b>

<b>${task.name}</b>
⏰ Scheduled at: ${task.time}
${task.description ? `
📝 ${task.description}` : ''}

<i>SchedSync Notification</i>`;
    case 'call':
      return baseMessage;
    default:
      return baseMessage;
  }
}

// Initialize cron job to run every minute
export const initNotificationCron = () => {
  cron.schedule('* * * * *', async () => {
    await processNotifications();
  });
};
