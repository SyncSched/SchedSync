import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/request';
import * as dashboardService from '../services/dashboard.service';

// Get all dashboard data
export const getDashboardDataHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const timeframe = (req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly';

    const dashboardData = await dashboardService.getDashboardData(userId, timeframe);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Get task statistics
export const getTaskStatsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const timeframe = (req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly';

    const taskStats = await dashboardService.getTaskStats(userId, timeframe);

    res.json(taskStats);
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};

// Get category breakdown
export const getCategoryBreakdownHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const timeframe = (req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly';

    const categoryBreakdown = await dashboardService.getCategoryBreakdown(userId, timeframe);

    res.json(categoryBreakdown);
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
};

// Get task completion data
export const getTaskCompletionDataHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const timeframe = (req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly';

    const taskCompletionData = await dashboardService.getTaskCompletionData(userId, timeframe);

    res.json(taskCompletionData);
  } catch (error) {
    console.error('Error fetching task completion data:', error);
    res.status(500).json({ error: 'Failed to fetch task completion data' });
  }
};

// Get productivity trend data
export const getProductivityTrendHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const timeframe = (req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'weekly';

    const productivityTrend = await dashboardService.getProductivityTrend(userId, timeframe);

    res.json(productivityTrend);
  } catch (error) {
    console.error('Error fetching productivity trend:', error);
    res.status(500).json({ error: 'Failed to fetch productivity trend' });
  }
};

// Get streak data
export const getStreakDataHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const streakData = await dashboardService.getStreakData(userId);

    res.json(streakData);
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
};

// Get upcoming tasks
export const getUpcomingTasksHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const upcomingTasks = await dashboardService.getUpcomingTasks(userId, limit);

    res.json(upcomingTasks);
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
  }
};

// Get most active hour
export const getMostActiveHourHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const mostActiveHour = await dashboardService.getMostActiveHour(userId);

    res.json({ mostActiveHour });
  } catch (error) {
    console.error('Error fetching most active hour:', error);
    res.status(500).json({ error: 'Failed to fetch most active hour' });
  }
};
