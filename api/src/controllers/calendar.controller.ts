import { Response, NextFunction } from 'express';
import {
  getUserCalendarEvents,
  hasCalendarIntegration,
  removeCalendarIntegration
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
