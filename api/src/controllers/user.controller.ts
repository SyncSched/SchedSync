import { Request, Response, NextFunction } from 'express';
import { getAllUsers, updateUserTimezone } from '../services/user.service';
import { AuthenticatedRequest } from '../types/request';
  
  export const getAllUsersHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  };

  export const getCurrentUser = (req: AuthenticatedRequest, res: Response): void => {
    res.json({ currentUser: req.user });
  };

  export const updateUserTimezoneHandler = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { timezone } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!timezone) {
        res.status(400).json({ error: 'Timezone is required' });
        return;
      }

      const updatedUser = await updateUserTimezone(userId, timezone);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };
