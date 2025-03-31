import crypto from 'crypto';

// Store temporary tokens with user IDs
const tokenMap = new Map<string, string>();

export const generateAuthToken = (userId: string): string => {
  const token = crypto.randomBytes(16).toString('hex');
  tokenMap.set(token, userId);
  
  // Token expires after 30 minutes
  setTimeout(() => {
    tokenMap.delete(token);
  }, 30 * 60 * 1000);
  
  return token;
};

export const validateAuthToken = (token: string): string | null => {
  const userId = tokenMap.get(token);
  if (userId) {
    tokenMap.delete(token);
    return userId;
  }
  return null;
};