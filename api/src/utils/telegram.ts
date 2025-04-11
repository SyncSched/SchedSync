import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { validateAuthToken, generateAuthToken } from './authToken';

dotenv.config();

const prisma = new PrismaClient();

// Initialize the Telegram bot with the token from environment variables
let bot: TelegramBot;

try {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const isDev = process.env.NODE_ENV !== 'production';

  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
    bot = {} as TelegramBot;
  } else {
    // In development, use polling; in production, use webhooks
    const options = isDev ? { polling: true } : { polling: false };
    bot = new TelegramBot(token, options);

    if (isDev) {
      console.log(`Telegram bot initialized with polling enabled for username: ${botUsername}`);

      // Register command handlers directly when using polling
      bot.onText(/\/start (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const authToken = match ? match[1] : '';
        const userId = await validateAuthToken(authToken);

        if (userId) {
          try {
            // Update the user record with the Telegram chat ID
            await prisma.user.update({
              where: { id: userId },
              data: {
                telegramChatId: chatId.toString(),
                isTelegramEnabled: true
              }
            });

            // Send confirmation message to the user
            await bot.sendMessage(
              chatId,
              'Your Telegram account has been successfully connected to SchedSync! You will now receive task notifications here.'
            );
            console.log(`User ${userId} connected Telegram chat ${chatId}`);
          } catch (error) {
            console.error('Error updating user with Telegram chat ID:', error);
            await bot.sendMessage(
              chatId,
              'Sorry, there was an error connecting your account. Please try again later.'
            );
          }
        } else {
          // Invalid or expired token
          await bot.sendMessage(
            chatId,
            'Sorry, this authentication link has expired or is invalid. Please generate a new link from the SchedSync settings page.'
          );
        }
      });

      // Handle plain /start command (without parameters)
      bot.onText(/^\/start$/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(
          chatId,
          'Welcome to SchedSync Bot! To connect your account, please use the "Connect Telegram" button in the SchedSync settings page.'
        );
      });
    } else {
      console.log(`Telegram bot initialized with webhooks for username: ${botUsername}`);
    }
  }
} catch (error) {
  console.error('Failed to initialize Telegram bot:', error);
  bot = {} as TelegramBot;
}

export { bot };

/**
 * Send a message to a Telegram chat
 * @param chatId The Telegram chat ID to send the message to
 * @param message The message text to send
 * @returns Promise resolving to true if successful, false otherwise
 */
export const sendTelegram = async (chatId: string, message: string): Promise<boolean> => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !bot.sendMessage) {
    console.log('[TELEGRAM DISABLED] Would have sent to', chatId, ':', message);
    return true;
  }

  console.log(`[TELEGRAM] Attempting to send message to chat ID: ${chatId}`);

  try {
    const result = await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log(`[TELEGRAM] Message sent successfully to ${chatId}, message ID: ${result.message_id}`);
    return true;
  } catch (error) {
    console.error(`[TELEGRAM] Error sending message to ${chatId}:`, error);
    return false;
  }
};

/**
 * Generate a deep link for users to connect with the bot
 * @param userId The user ID to associate with the Telegram account
 * @returns A URL that users can click to start a chat with the bot and authenticate
 */
export const generateTelegramAuthLink = async (userId: string): Promise<string> => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;

  if (!botUsername) {
    console.error('TELEGRAM_BOT_USERNAME not found in environment variables');
    return '#';
  }

  try {
    // Generate a secure token that maps to this user
    const authToken = await generateAuthToken(userId);

    // Create a deep link with the start parameter containing the auth token
    return `https://t.me/${botUsername}?start=${authToken}`;
  } catch (error) {
    console.error('[TELEGRAM] Error generating auth link:', error);
    return '#';
  }
};
