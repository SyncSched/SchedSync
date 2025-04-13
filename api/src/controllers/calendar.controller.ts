import { Response, NextFunction } from 'express';
import {
  getUserCalendarEvents,
  hasCalendarIntegration,
  removeCalendarIntegration,
  getCurrentDayCalendarEvents
} from '../services/calendar.service';
import { AuthenticatedRequest } from '../types/request';
import { BadUserInputError, EntityNotFoundError } from '../errors';

/**
 * Get user's calendar events
 */
export const getCalendarEventsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new BadUserInputError({ message: 'User ID is missing from request' }));
    }

    // Check if user has calendar integration
    const hasIntegration = await hasCalendarIntegration(userId);

    if (!hasIntegration) {
      return next(new EntityNotFoundError('Calendar integration not found for this user'));
    }

    // Parse date range from query parameters
    const timeMin = req.query.timeMin ? new Date(req.query.timeMin as string) : new Date();
    const timeMax = req.query.timeMax
      ? new Date(req.query.timeMax as string)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days from now

    try {
      const events = await getUserCalendarEvents(userId, timeMin, timeMax);

      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has calendar integration
 */
export const checkCalendarIntegrationHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new BadUserInputError({ message: 'User ID is missing from request' }));
    }

    const hasIntegration = await hasCalendarIntegration(userId);

    res.status(200).json({
      success: true,
      data: {
        hasCalendarIntegration: hasIntegration,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove calendar integration
 */
export const removeCalendarIntegrationHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new BadUserInputError({ message: 'User ID is missing from request' }));
    }

    // Check if user has calendar integration
    const hasIntegration = await hasCalendarIntegration(userId);

    if (!hasIntegration) {
      return next(new EntityNotFoundError('Calendar integration not found for this user'));
    }

    const success = await removeCalendarIntegration(userId);

    res.status(200).json({
      success,
      message: success ? 'Calendar integration removed successfully' : 'Failed to remove calendar integration',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get calendar events for the current day
 * This is specifically used for schedule generation
 */
export const getCurrentDayEventsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new BadUserInputError({ message: 'User ID is missing from request' }));
    }

    // Get date from request body or use current date
    const date = req.body.date ? new Date(req.body.date) : new Date();

    // Check if user has calendar integration
    const hasIntegration = await hasCalendarIntegration(userId);

    // If no integration, return empty array (not an error)
    if (!hasIntegration) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'No calendar integration found for this user'
      });
      return;
    }

    try {
      const events = await getCurrentDayCalendarEvents(userId, date);

      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Error fetching current day calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [] // Return empty array on error
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get calendar events for the current day as tasks
 * This transforms calendar events into a format compatible with the schedule
 */
export const getCalendarEventsAsTasksHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new BadUserInputError({ message: 'User ID is missing from request' }));
    }

    // Get date from request body or use current date
    const date = req.body.date ? new Date(req.body.date) : new Date();

    // Check if user has calendar integration
    const hasIntegration = await hasCalendarIntegration(userId);

    // If no integration, return empty array (not an error)
    if (!hasIntegration) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'No calendar integration found for this user'
      });
      return;
    }

    try {
      const events = await getCurrentDayCalendarEvents(userId, date);

      // Transform events into task format
      const tasks = events.map(event => {
        // Extract start and end times
        const startTime = event.start?.dateTime ? new Date(event.start.dateTime) : null;
        const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;

        // Calculate duration in minutes
        const durationMinutes = startTime && endTime ?
          Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) :
          60; // Default to 1 hour if times are not available

        // Format time as HH:MM
        const formattedTime = startTime ?
          `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}` :
          '09:00'; // Default time if not available

        return {
          name: event.summary || 'Untitled Event',
          description: event.description || '',
          time: formattedTime,
          duration: durationMinutes,
          location: event.location || '',
          isGoogleCalendarEvent: true, // Mark as Google Calendar event
          googleEventId: event.id, // Store the Google event ID for reference
          status: 'PENDING',
          priority: 'HIGH', // Calendar events are typically high priority
          isEmailEnabled: false,
          isWhatsAppEnabled: false,
          isTelegramEnabled: false,
          isCallEnabled: false
        };
      });

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      console.error('Error fetching calendar events as tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events as tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [] // Return empty array on error
      });
    }
  } catch (error) {
    next(error);
  }
};
