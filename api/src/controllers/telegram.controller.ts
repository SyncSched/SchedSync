import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { bot } from '../utils/telegram';
import { validateAuthToken } from '../utils/authToken';
import { disconnectTelegramForUser } from '../services/user.service';
import { AuthenticatedRequest } from '../types/request';


const prisma = new PrismaClient();

/**
 * Handle Telegram webhook events
 * This endpoint receives updates from Telegram when users interact with our bot
 */
export const telegramWebhookHandler = async (req: Request, res: Response) => {
  try {
    const update = req.body;
    console.log('[TELEGRAM WEBHOOK] Received update:', JSON.stringify(update, null, 2));

    // Handle /start command with authentication token
    if (update.message?.text?.startsWith('/start')) {
      console.log('[TELEGRAM WEBHOOK] Processing /start command');
      await handleStartCommand(update);
    } else {
      console.log('[TELEGRAM WEBHOOK] Received message that is not a /start command');
    }

    // Always respond with 200 OK to Telegram
    return res.status(200).send('OK');
  } catch (error) {
    console.error('[TELEGRAM WEBHOOK] Error handling webhook:', error);
    // Still return 200 to Telegram to avoid repeated delivery attempts
    return res.status(200).send('OK');
  }
};

/**
 * Handle the /start command, which is sent when a user clicks on the auth link
 */
async function handleStartCommand(update: any) {
  const chatId = update.message.chat.id;
  const messageText = update.message.text;
  const parts = messageText.split(' ');

  console.log(`[TELEGRAM] Processing /start command from chat ID: ${chatId}, message: "${messageText}"`);

  // If there's a parameter after /start, it's our auth token
  if (parts.length > 1) {
    const authToken = parts[1];
    console.log(`[TELEGRAM] Auth token received: ${authToken}`);

    const userId = await validateAuthToken(authToken);
    console.log(`[TELEGRAM] Validated user ID: ${userId || 'invalid token'}`);

    if (userId) {
      try {
        console.log(`[TELEGRAM] Updating user ${userId} with Telegram chat ID ${chatId}`);

        // Update the user record with the Telegram chat ID
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            telegramChatId: chatId.toString(),
            isTelegramEnabled: true
          }
        });

        console.log(`[TELEGRAM] User updated successfully: ${updatedUser.id}, telegramChatId: ${updatedUser.telegramChatId}`);

        // Send confirmation message to the user
        await bot.sendMessage(
          chatId,
          'Your Telegram account has been successfully connected to SchedSync! You will now receive task notifications here.'
        );

        console.log(`[TELEGRAM] Confirmation message sent to chat ID: ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Error updating user with Telegram chat ID:`, error);
        await bot.sendMessage(
          chatId,
          'Sorry, there was an error connecting your account. Please try again later.'
        );
      }
    } else {
      // Invalid or expired token
      console.log(`[TELEGRAM] Invalid or expired token: ${authToken}`);
      await bot.sendMessage(
        chatId,
        'Sorry, this authentication link has expired or is invalid. Please generate a new link from the SchedSync settings page.'
      );
    }
  } else {
    // User started the bot without an auth token
    console.log(`[TELEGRAM] User started bot without auth token, chat ID: ${chatId}`);
    await bot.sendMessage(
      chatId,
      'Welcome to SchedSync Bot! To connect your account, please use the "Connect Telegram" button in the SchedSync settings page.'
    );
  }
}

/**
 * Set up the webhook URL for the Telegram bot
 * This is typically called once during deployment or when the webhook URL changes
 */
export const setTelegramWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookUrl, secretToken } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    // Set the webhook with Telegram
    const result = await bot.setWebHook(webhookUrl, {
      secret_token: secretToken
    });

    if (result) {
      return res.json({ success: true, message: 'Webhook set successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to set webhook' });
    }
  } catch (error) {
    console.error('Error setting Telegram webhook:', error);
    return res.status(500).json({ error: 'Error setting webhook' });
  }
};

/**
 * Disconnect Telegram integration for the authenticated user
 */
export const disconnectTelegramHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Assuming userId is available from auth middleware (req.user.id)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await disconnectTelegramForUser(userId);
    return res.json({ success: true, message: 'Telegram integration disconnected.' });
  } catch (error) {
    console.error('Error disconnecting Telegram integration:', error);
    return res.status(500).json({ error: 'Failed to disconnect Telegram integration.' });
  }
};
