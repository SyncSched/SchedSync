import { CreateGoalInput, Goal, UpdateGoalInput } from '../models/goal.model';
import { EntityNotFoundError } from '../errors';
import { prisma } from '../utils/prisma-client';

/**
 * Get all goals for a user
 */
export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return goals;
  } catch (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }
};

/**
 * Create a new goal
 */
export const createGoal = async (input: CreateGoalInput): Promise<Goal> => {
  try {
    const goal = await prisma.goal.create({
      data: {
        title: input.title,
        userId: input.userId,
        isCompleted: false
      }
    });

    return goal;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

/**
 * Update a goal
 */
export const updateGoal = async (goalId: string, userId: string, input: UpdateGoalInput): Promise<Goal> => {
  try {
    // First check if the goal exists and belongs to the user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId
      }
    });

    if (!existingGoal) {
      throw new EntityNotFoundError('Goal not found or unauthorized');
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.isCompleted !== undefined && { isCompleted: input.isCompleted })
      }
    });

    return updatedGoal;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (goalId: string, userId: string): Promise<void> => {
  try {
    // First check if the goal exists and belongs to the user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId
      }
    });

    if (!existingGoal) {
      throw new EntityNotFoundError('Goal not found or unauthorized');
    }

    // Delete the goal
    await prisma.goal.delete({
      where: { id: goalId }
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};
