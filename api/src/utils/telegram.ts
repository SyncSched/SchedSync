import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { validateAuthToken, generateAuthToken } from './authToken';

dotenv.config();

const prisma = new PrismaClient();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: true });

// Initialize bot with commands
bot.setMyCommands([
  { command: '/start', description: 'Start the authentication process' }
]);

// Handle /start command with auth token
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!match) {
    bot.sendMessage(chatId, "Invalid authentication link. Please use the link provided in the app.");
    return;
  }

  const token = match[1];
  const userId = validateAuthToken(token);

  if (!userId) {
    bot.sendMessage(chatId, "This authentication link has expired or is invalid. Please generate a new one from the app.");
    return;
  }

  try {
    // Update user's telegram chat ID
    await prisma.user.update({
      where: { id: userId },
      data: { 
        telegramChatId: String(chatId),
        isTelegramEnabled: true
      }
    });

    bot.sendMessage(chatId, 
      "✅ Successfully connected!\n\n" +
      "You will now receive task reminders through Telegram.\n" +
      "To stop receiving notifications, you can disable Telegram notifications in your app settings."
    );
  } catch (error) {
    console.error("Error updating user's Telegram chat ID:", error);
    bot.sendMessage(chatId, "Sorry, there was an error connecting your account. Please try again.");
  }
});

// Original sendTelegram function
export const sendTelegram = async (chatId: string, message: string): Promise<boolean> => {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error("Telegram bot token not configured");
      return false;
    }
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    console.log(`Telegram message sent to chat ID: ${chatId}`);
    return true;
  } catch (error) {
    console.error("Error sending telegram message:", error);
    return false;
  }
};

// Generate Telegram auth link
export const generateTelegramAuthLink = (userId: string): string => {
  const token = generateAuthToken(userId);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  return `https://t.me/${botUsername}?start=${token}`;
};
