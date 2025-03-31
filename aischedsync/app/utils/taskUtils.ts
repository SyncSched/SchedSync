import { Task } from '@/api/lib';
import { addMinutesToTime, getTimeDifferenceInMinutes, formatToHHMM } from './dateUtils';

export const recalculateTaskTimes = (
  tasks: Task[],
  sourceIndex: number,
  targetIndex: number
): Task[] => {
  if (sourceIndex === targetIndex) return [...tasks];
  
  const updatedTasks = [...tasks];
  const movedTask = { ...tasks[sourceIndex] };
  const isMovingUp = targetIndex < sourceIndex;
  
  // Determine the range of tasks affected
  const startIndex = Math.min(sourceIndex, targetIndex);
  const endIndex = Math.max(sourceIndex, targetIndex);
  
  // Store the original start time of the first task and end time of last task in range
  const originalStartDate = new Date(tasks[startIndex].time);
  const lastTask = tasks[endIndex];
  const lastTaskDate = new Date(lastTask.time);
  const originalEndDate = new Date(lastTaskDate.getTime() + (lastTask.duration * 60000));
  
  if (isMovingUp) {
    // Moving task earlier in schedule
    let currentDate = new Date(originalStartDate);
    
    // Place moved task at target position
    movedTask.time = currentDate.toISOString();
    currentDate = new Date(currentDate.getTime() + (movedTask.duration * 60000));
    
    // Shift affected tasks after moved task
    for (let i = targetIndex; i < sourceIndex; i++) {
      const nextTask = { ...tasks[i] };
      nextTask.time = currentDate.toISOString();
      currentDate = new Date(currentDate.getTime() + (nextTask.duration * 60000));
      updatedTasks[i + 1] = nextTask;
    }
    
    updatedTasks[targetIndex] = movedTask;
  } else {
    // Moving task later in schedule
    let currentDate = new Date(originalStartDate);
    
    // Shift affected tasks up first
    for (let i = startIndex; i < targetIndex; i++) {
      const task = { ...tasks[i + 1] };
      task.time = currentDate.toISOString();
      currentDate = new Date(currentDate.getTime() + (task.duration * 60000));
      updatedTasks[i] = task;
    }
    
    // Place moved task at target position
    movedTask.time = currentDate.toISOString();
    updatedTasks[targetIndex] = movedTask;
  }

  // Verify and adjust to maintain the original time window
  const newLastTask = updatedTasks[endIndex];
  const newLastTaskDate = new Date(newLastTask.time);
  const newEndDate = new Date(newLastTaskDate.getTime() + (newLastTask.duration * 60000));
  
  const timeDiff = getTimeDifferenceInMinutes(originalEndDate, newEndDate);
  if (timeDiff !== 0) {
    // If there's any drift, adjust all tasks proportionally
    let currentDate = new Date(originalStartDate);
    for (let i = startIndex; i <= endIndex; i++) {
      updatedTasks[i].time = currentDate.toISOString();
      currentDate = new Date(currentDate.getTime() + (updatedTasks[i].duration * 60000));
    }
  }

  return updatedTasks;
}; 
