import { Response, NextFunction } from 'express';
import { createGoal, deleteGoal, getUserGoals, updateGoal } from '../services/goal.service';
import { BadUserInputError, EntityNotFoundError } from '../errors';
import { AuthenticatedRequest } from '../types/request';

/**
 * Get all goals for the authenticated user
 */
export const getUserGoalsHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }
    
    const goals = await getUserGoals(userId);
    
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new goal
 */
export const createGoalHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title } = req.body;
    
    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return next(new BadUserInputError({ message: "Goal title is required" }));
    }
    
    const goal = await createGoal({
      title: title.trim(),
      userId
    });
    
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a goal
 */
export const updateGoalHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;
    const { title, isCompleted } = req.body;
    
    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }
    
    if (!goalId) {
      return next(new BadUserInputError({ message: "Goal ID is required" }));
    }
    
    // Validate that at least one field is being updated
    if (title === undefined && isCompleted === undefined) {
      return next(new BadUserInputError({ message: "At least one field must be updated" }));
    }
    
    // Validate title if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return next(new BadUserInputError({ message: "Goal title cannot be empty" }));
    }
    
    // Validate isCompleted if provided
    if (isCompleted !== undefined && typeof isCompleted !== 'boolean') {
      return next(new BadUserInputError({ message: "isCompleted must be a boolean" }));
    }
    
    const updatedGoal = await updateGoal(goalId, userId, {
      ...(title !== undefined && { title: title.trim() }),
      ...(isCompleted !== undefined && { isCompleted })
    });
    
    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a goal
 */
export const deleteGoalHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;
    
    if (!userId) {
      return next(new BadUserInputError({ message: "User ID is missing from request" }));
    }
    
    if (!goalId) {
      return next(new BadUserInputError({ message: "Goal ID is required" }));
    }
    
    await deleteGoal(goalId, userId);
    
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
};
