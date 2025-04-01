import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { validateAuthToken, generateAuthToken } from './authToken';

dotenv.config();

const prisma = new PrismaClient();

// Temporarily create a dummy bot instance without actual functionality
export const bot = {} as TelegramBot;

// Modify sendTelegram to just log instead of actually sending
export const sendTelegram = async (chatId: string, message: string): Promise<boolean> => {
  console.log('[TELEGRAM DISABLED] Would have sent to', chatId, ':', message);
  return true;
};

export const generateTelegramAuthLink = (userId: string): string => {
  console.log('[TELEGRAM DISABLED] Auth link requested for user:', userId);
  return '#';
};
