import { Task } from '@/api/lib';
import { addMinutesToTime, getTimeDifferenceInMinutes } from './dateUtils';

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
  const originalStartTime = tasks[startIndex].time;
  const lastTask = tasks[endIndex];
  const originalEndTime = addMinutesToTime(lastTask.time, lastTask.duration);
  
  if (isMovingUp) {
    // Moving task earlier in schedule
    let currentTime = originalStartTime; // Always start with original start time
    
    // Place moved task at target position
    movedTask.time = currentTime;
    currentTime = addMinutesToTime(currentTime, movedTask.duration);
    
    // Shift affected tasks after moved task
    for (let i = targetIndex; i < sourceIndex; i++) {
      const nextTask = { ...tasks[i] };
      nextTask.time = currentTime;
      currentTime = addMinutesToTime(currentTime, nextTask.duration);
      updatedTasks[i + 1] = nextTask;
    }
    
    updatedTasks[targetIndex] = movedTask;
  } else {
    // Moving task later in schedule
    let currentTime = originalStartTime; // Always start with original start time
    
    // Shift affected tasks up first
    for (let i = startIndex; i < targetIndex; i++) {
      const task = { ...tasks[i + 1] };
      task.time = currentTime;
      currentTime = addMinutesToTime(currentTime, task.duration);
      updatedTasks[i] = task;
    }
    
    // Place moved task at target position
    movedTask.time = currentTime;
    updatedTasks[targetIndex] = movedTask;
  }

  // Verify and adjust to maintain the original time window
  const newLastTask = updatedTasks[endIndex];
  const newEndTime = addMinutesToTime(newLastTask.time, newLastTask.duration);
  
  if (newEndTime !== originalEndTime) {
    // If there's any drift, adjust all tasks proportionally
    const timeDiff = getTimeDifferenceInMinutes(originalEndTime, newEndTime);
    if (timeDiff !== 0) {        
      let currentTime = originalStartTime;
      for (let i = startIndex; i <= endIndex; i++) {
        updatedTasks[i].time = currentTime;
        currentTime = addMinutesToTime(currentTime, updatedTasks[i].duration);
      }
    }
  }

  return updatedTasks;
}; 