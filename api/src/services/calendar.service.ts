import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

// Interface for calendar events
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status: string;
  htmlLink: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

/**
 * Get OAuth2 client for a user
 */
async function getOAuth2Client(userId: string): Promise<OAuth2Client | null> {
  try {
    const calendarToken = await prisma.calendarToken.findUnique({
      where: { userId },
    });

    if (!calendarToken) {
      console.error('No calendar token found for user:', userId);
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NODE_API_URL}/auth/google/callback`
    );

    // Check if token is expired
    const isTokenExpired = new Date() > new Date(calendarToken.expiresAt);

    if (isTokenExpired) {
      console.log('Token expired, refreshing...');

      // Check if we have a refresh token
      if (!calendarToken.refreshToken) {
        console.error('No refresh token available for user:', userId);
        return null;
      }

      oauth2Client.setCredentials({
        refresh_token: calendarToken.refreshToken,
      });

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Update token in database
        if (credentials.access_token && credentials.expiry_date) {
          await prisma.calendarToken.update({
            where: { userId },
            data: {
              accessToken: credentials.access_token,
              expiresAt: new Date(credentials.expiry_date),
            },
          });
        }
      } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
      }
    } else {
      // Set credentials from database
      oauth2Client.setCredentials({
        access_token: calendarToken.accessToken,
        refresh_token: calendarToken.refreshToken,
      });
    }

    return oauth2Client;
  } catch (error) {
    console.error('Error getting OAuth2 client:', error);
    return null;
  }
}

/**
 * Get user's calendar events
 */
export async function getUserCalendarEvents(
  userId: string,
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days from now
): Promise<CalendarEvent[]> {
  try {
    const oauth2Client = await getOAuth2Client(userId);

    if (!oauth2Client) {
      throw new Error('Failed to get OAuth2 client');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Check if a user has connected their Google Calendar
 */
export async function hasCalendarIntegration(userId: string): Promise<boolean> {
  try {
    const calendarToken = await prisma.calendarToken.findUnique({
      where: { userId },
    });

    return !!calendarToken;
  } catch (error) {
    console.error('Error checking calendar integration:', error);
    return false;
  }
}

/**
 * Get user's calendar events for the current day
 * This is specifically used for schedule generation to include existing calendar events
 */
export async function getCurrentDayCalendarEvents(userId: string, date: Date): Promise<CalendarEvent[]> {
  try {
    // Create start and end of the day in the user's timezone
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get user's timezone
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });

    // If we have the user's timezone, adjust the dates
    if (user && user.timezone) {
      console.log(`Getting calendar events for ${date.toISOString()} in timezone ${user.timezone}`);
    }

    return await getUserCalendarEvents(userId, startOfDay, endOfDay);
  } catch (error) {
    console.error('Error fetching current day calendar events:', error);
    return [];
  }
}

/**
 * Remove calendar integration for a user
 */
export async function removeCalendarIntegration(userId: string): Promise<boolean> {
  try {
    await prisma.calendarToken.delete({
      where: { userId },
    });

    return true;
  } catch (error) {
    console.error('Error removing calendar integration:', error);
    return false;
  }
}
