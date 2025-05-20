import crypto from 'crypto';
import { prisma } from './prisma-client';

// Store temporary tokens in the database using the TelegramAuth model
export const generateAuthToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(16).toString('hex');

  // Set expiration time to 30 minutes from now
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  try {
    // Store the token in the database
    await prisma.telegramAuth.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });

    console.log(`[AUTH TOKEN] Created token for user ${userId}, expires at ${expiresAt}`);
    return token;
  } catch (error) {
    console.error('[AUTH TOKEN] Error creating token:', error);
    throw error;
  }
};

export const validateAuthToken = async (token: string): Promise<string | null> => {
  try {
    // Find the token in the database
    const authRecord = await prisma.telegramAuth.findUnique({
      where: { token }
    });

    // If token doesn't exist or is expired, return null
    if (!authRecord || authRecord.expiresAt < new Date()) {
      console.log(`[AUTH TOKEN] Token ${token} is invalid or expired`);
      return null;
    }

    // Delete the token to prevent reuse
    await prisma.telegramAuth.delete({
      where: { id: authRecord.id }
    });

    console.log(`[AUTH TOKEN] Validated token for user ${authRecord.userId}`);
    return authRecord.userId;
  } catch (error) {
    console.error('[AUTH TOKEN] Error validating token:', error);
    return null;
  }
};