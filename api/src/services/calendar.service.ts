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
  const startTime = Date.now();
  console.log(`[TIME] Starting OAuth2 client initialization at: ${new Date().toISOString()}`);

  try {
    // Get token from database
    const tokenLookupStartTime = Date.now();
    console.log(`[TIME] Looking up calendar token at: ${new Date().toISOString()}`);
    const calendarToken = await prisma.calendarToken.findUnique({
      where: { userId },
    });
    console.log(`[TIME] Calendar token lookup completed at: ${new Date().toISOString()} (${Date.now() - tokenLookupStartTime}ms)`);

    if (!calendarToken) {
      console.error('No calendar token found for user:', userId);
      return null;
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NODE_API_URL}/auth/google/callback`
    );

    // Check if token is expired
    const isTokenExpired = new Date() > new Date(calendarToken.expiresAt);

    if (isTokenExpired) {
      console.log(`[TIME] Token expired, starting refresh at: ${new Date().toISOString()}`);
      const refreshStartTime = Date.now();

      // Check if we have a refresh token
      if (!calendarToken.refreshToken) {
        console.error('No refresh token available for user:', userId);
        return null;
      }

      oauth2Client.setCredentials({
        refresh_token: calendarToken.refreshToken,
      });

      try {
        // Refresh token
        console.log(`[TIME] Calling Google API to refresh token at: ${new Date().toISOString()}`);
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log(`[TIME] Token refresh completed at: ${new Date().toISOString()} (${Date.now() - refreshStartTime}ms)`);

        // Update token in database
        if (credentials.access_token && credentials.expiry_date) {
          console.log(`[TIME] Updating token in database at: ${new Date().toISOString()}`);
          const dbUpdateStartTime = Date.now();
          await prisma.calendarToken.update({
            where: { userId },
            data: {
              accessToken: credentials.access_token,
              expiresAt: new Date(credentials.expiry_date),
            },
          });
          console.log(`[TIME] Token database update completed at: ${new Date().toISOString()} (${Date.now() - dbUpdateStartTime}ms)`);
        }
      } catch (error) {
        console.error('Error refreshing access token:', error);
        console.log(`[TIME] Token refresh failed at: ${new Date().toISOString()} (${Date.now() - refreshStartTime}ms)`);
        return null;
      }
    } else {
      // Set credentials from database
      oauth2Client.setCredentials({
        access_token: calendarToken.accessToken,
        refresh_token: calendarToken.refreshToken,
      });
      console.log(`[TIME] Using existing valid token`);
    }

    console.log(`[TIME] OAuth2 client initialization completed at: ${new Date().toISOString()} (${Date.now() - startTime}ms)`);
    return oauth2Client;
  } catch (error) {
    console.error('Error getting OAuth2 client:', error);
    console.log(`[TIME] OAuth2 client initialization failed at: ${new Date().toISOString()} (${Date.now() - startTime}ms)`);
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
  const startTime = Date.now();
  console.log(`[TIME] Starting Google Calendar API call at: ${new Date().toISOString()}`);

  try {
    // Get OAuth client
    const oauthStartTime = Date.now();
    console.log(`[TIME] Getting OAuth2 client at: ${new Date().toISOString()}`);
    const oauth2Client = await getOAuth2Client(userId);
    console.log(`[TIME] OAuth2 client obtained at: ${new Date().toISOString()} (${Date.now() - oauthStartTime}ms)`);

    if (!oauth2Client) {
      throw new Error('Failed to get OAuth2 client');
    }

    // Initialize calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Make API call to Google Calendar
    const apiCallStartTime = Date.now();
    console.log(`[TIME] Making Google Calendar API request at: ${new Date().toISOString()}`);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    console.log(`[TIME] Google Calendar API response received at: ${new Date().toISOString()} (${Date.now() - apiCallStartTime}ms)`);
    console.log(`[TIME] Total Google Calendar events fetch time: ${Date.now() - startTime}ms`);

    return (response.data.items || []) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    console.log(`[TIME] Google Calendar API call failed at: ${new Date().toISOString()} (${Date.now() - startTime}ms)`);
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
  const startTime = Date.now();
  console.log(`[TIME] Starting getCurrentDayCalendarEvents at: ${new Date().toISOString()}`);

  try {
    // Get user's timezone
    const userLookupStartTime = Date.now();
    console.log(`[TIME] Looking up user timezone at: ${new Date().toISOString()}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });
    console.log(`[TIME] User timezone lookup completed at: ${new Date().toISOString()} (${Date.now() - userLookupStartTime}ms)`);

    if (!user) {
      throw new Error('User not found');
    }

    const userTimezone = user.timezone || 'UTC';

    // Helper function to get timezone offset
    function getTimezoneOffset(timezone: string, date: Date): number {
      const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      return (utcDate.getTime() - localDate.getTime()) / 60000; // Convert ms to minutes
    }

    // Calculate timezone offset
    const calculatedOffset = getTimezoneOffset(userTimezone, date);

    // For a user in India (UTC+5:30) requesting April 11:
    // - startOfDay should be April 11, 18:30:00 UTC (which is April 12, 00:00:00 in India)
    // - endOfDay should be April 12, 18:29:59 UTC (which is April 13, 23:59:59 in India)

    // Create a new date object for the requested date
    const requestDate = new Date(date);

    // Get the date in the user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    // Get the date parts in the user's timezone
    const dateParts = formatter.formatToParts(requestDate);
    const year = parseInt(dateParts.find(part => part.type === 'year')?.value || '2025');
    const month = parseInt(dateParts.find(part => part.type === 'month')?.value || '01') - 1; // Month is 0-indexed
    const day = parseInt(dateParts.find(part => part.type === 'day')?.value || '01');

    // For India (UTC+5:30), if the user requests April 11:
    // We need to create April 11, 18:30:00 UTC (which is April 12, 00:00:00 in India)

    // Create the start time in UTC
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

    // Adjust for timezone offset to get the correct UTC time
    // For India (UTC+5:30), we need to subtract 5.5 hours from local midnight to get UTC time
    startOfDay.setUTCMinutes(startOfDay.getUTCMinutes() + calculatedOffset);

    // Create the end time (23:59:59.999) in the user's local timezone
    // This is exactly 24 hours after the start time, minus 1 millisecond
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(endOfDay.getUTCHours() + 24);
    endOfDay.setUTCMilliseconds(endOfDay.getUTCMilliseconds() - 1);

    console.log('Calendar Query Range:', {
      userTimezone,
      calculatedOffset,
      date: date.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    const events = await getUserCalendarEvents(userId, startOfDay, endOfDay);
    console.log(`[TIME] getCurrentDayCalendarEvents completed at: ${new Date().toISOString()} (${Date.now() - startTime}ms)`);
    console.log(`[TIME] Found ${events.length} calendar events`);

    return events;
  } catch (error) {
    console.error('Error fetching current day calendar events:', error);
    console.log(`[TIME] getCurrentDayCalendarEvents failed at: ${new Date().toISOString()} (${Date.now() - startTime}ms)`);
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
