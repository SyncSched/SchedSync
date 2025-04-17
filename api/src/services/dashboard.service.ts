import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

const prisma = new PrismaClient();

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  missed: number;
  adherenceRate: number;
}

interface CategoryBreakdown {
  work: number;
  personal: number;
  health: number;
  learning: number;
  other: number;
}

interface TaskCompletionData {
  labels: string[];
  completed: number[];
  total: number[];
}

interface ProductivityTrend {
  labels: string[];
  productivityScore: number[];
  completionRate: number[];
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  adherenceRate: number;
  lastSevenDays: boolean[];
}

export interface DashboardData {
  taskStats: TaskStats;
  categoryBreakdown: CategoryBreakdown;
  taskCompletion: TaskCompletionData;
  productivityTrend: ProductivityTrend;
  streakData: StreakData;
  upcomingTasks: any[];
  mostActiveHour: string;
}

// Helper function to categorize tasks
const categorizeTask = (taskName: string): 'work' | 'personal' | 'health' | 'learning' | 'other' => {
  const lowerCaseName = taskName.toLowerCase();

  if (lowerCaseName.includes('work') || lowerCaseName.includes('meeting') ||
      lowerCaseName.includes('project') || lowerCaseName.includes('email') ||
      lowerCaseName.includes('call') || lowerCaseName.includes('presentation')) {
    return 'work';
  }

  if (lowerCaseName.includes('gym') || lowerCaseName.includes('workout') ||
      lowerCaseName.includes('exercise') || lowerCaseName.includes('health') ||
      lowerCaseName.includes('doctor') || lowerCaseName.includes('medic')) {
    return 'health';
  }

  if (lowerCaseName.includes('study') || lowerCaseName.includes('learn') ||
      lowerCaseName.includes('read') || lowerCaseName.includes('course') ||
      lowerCaseName.includes('class') || lowerCaseName.includes('book')) {
    return 'learning';
  }

  if (lowerCaseName.includes('family') || lowerCaseName.includes('friend') ||
      lowerCaseName.includes('personal') || lowerCaseName.includes('shop') ||
      lowerCaseName.includes('home') || lowerCaseName.includes('relax')) {
    return 'personal';
  }

  return 'other';
};

// Get task statistics
export const getTaskStats = async (userId: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TaskStats> => {
  let startDate: Date, endDate: Date;
  const now = new Date();

  switch (timeframe) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    default:
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
  }

  // Get all tasks for the user within the timeframe
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      originalData: true
    }
  });

  // Flatten all tasks from all schedules
  const tasks = schedules.flatMap(schedule => schedule.originalData);

  // Calculate statistics
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const pending = tasks.filter(task => task.status === TaskStatus.PENDING).length;
  const missed = tasks.filter(task => task.status === TaskStatus.OVERDUE).length;
  const adherenceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    missed,
    adherenceRate
  };
};

// Get category breakdown
export const getCategoryBreakdown = async (userId: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<CategoryBreakdown> => {
  let startDate: Date, endDate: Date;
  const now = new Date();

  switch (timeframe) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    default:
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
  }

  // Get all tasks for the user within the timeframe
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      originalData: true
    }
  });

  // Flatten all tasks from all schedules
  const tasks = schedules.flatMap(schedule => schedule.originalData);

  // Initialize category counts
  const categories: CategoryBreakdown = {
    work: 0,
    personal: 0,
    health: 0,
    learning: 0,
    other: 0
  };

  // Count tasks by category
  tasks.forEach(task => {
    const category = categorizeTask(task.name);
    categories[category]++;
  });

  return categories;
};

// Get task completion data
export const getTaskCompletionData = async (userId: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TaskCompletionData> => {
  let startDate: Date, endDate: Date;
  const now = new Date();
  let labels: string[] = [];

  switch (timeframe) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      // Create labels for every 3 hours from 0 to 24
      labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
      break;
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      break;
    default:
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  // Get all schedules for the user within the timeframe
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      originalData: true
    }
  });

  console.log(startDate, endDate);

  // Initialize data arrays
  const completed: number[] = Array(labels.length).fill(0);
  const total: number[] = Array(labels.length).fill(0);

  // For daily timeframe
  if (timeframe === 'daily') {
    schedules.forEach(schedule => {
      schedule.originalData.forEach(task => {
        const hour = new Date(task.time).getHours();

        // Determine which 3-hour block this task falls into (0-7)
        const timeSlot = Math.floor(hour / 3);

        total[timeSlot]++;
        if (task.status === TaskStatus.COMPLETED) {
          completed[timeSlot]++;
        }
      });
    });
  }

  // For weekly timeframe
  else if (timeframe === 'weekly') {
    schedules.forEach(schedule => {
      schedule.originalData.forEach(task => {
        const dayOfWeek = new Date(task.time).getDay();
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start (0 = Monday)

        total[dayIndex]++;
        if (task.status === TaskStatus.COMPLETED) {
          completed[dayIndex]++;
        }
      });
    });
  }

  // For monthly timeframe
  else {
    schedules.forEach(schedule => {
      schedule.originalData.forEach(task => {
        const date = new Date(task.time);
        const dayOfMonth = date.getDate();
        let weekIndex = 0;

        if (dayOfMonth <= 7) weekIndex = 0;
        else if (dayOfMonth <= 14) weekIndex = 1;
        else if (dayOfMonth <= 21) weekIndex = 2;
        else weekIndex = 3;

        total[weekIndex]++;
        if (task.status === TaskStatus.COMPLETED) {
          completed[weekIndex]++;
        }
      });
    });
  }

  return {
    labels,
    completed,
    total
  };
};

// Get productivity trend data
export const getProductivityTrend = async (userId: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<ProductivityTrend> => {
  let startDate: Date, endDate: Date;
  const now = new Date();
  let labels: string[] = [];

  switch (timeframe) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      // Create labels for every 3 hours from 0 to 24
      labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
      break;
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      break;
    default:
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  // Get all schedules for the user within the timeframe
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      originalData: true
    }
  });

  // Initialize data arrays
  const taskCounts = Array(labels.length).fill(0);
  const completedCounts = Array(labels.length).fill(0);
  const onTimeCounts = Array(labels.length).fill(0);
  const priorityWeights = Array(labels.length).fill(0);

  // Process tasks based on timeframe
  if (timeframe === 'daily') {
    schedules.forEach(schedule => {
      schedule.originalData.forEach(task => {
        const taskDate = new Date(task.time);
        const hour = taskDate.getHours();

        // Determine which 3-hour block this task falls into
        const timeSlot = Math.floor(hour / 3);

        // Count the task
        taskCounts[timeSlot]++;

        // Count completed tasks
        if (task.status === TaskStatus.COMPLETED) {
          completedCounts[timeSlot]++;

          // Check if task was completed on time (not overdue)
          if (task.completedAt) {
            const completedTime = new Date(task.completedAt);
            const scheduledEndTime = new Date(taskDate.getTime() + task.duration * 60000);

            if (completedTime <= scheduledEndTime) {
              onTimeCounts[timeSlot]++;
            }
          }
        }

        // Add priority weight
        switch (task.priority) {
          case Priority.HIGH:
            priorityWeights[timeSlot] += 3;
            break;
          case Priority.MEDIUM:
            priorityWeights[timeSlot] += 2;
            break;
          case Priority.LOW:
            priorityWeights[timeSlot] += 1;
            break;
          default:
            priorityWeights[timeSlot] += 1;
        }
      });
    });
  } else if (timeframe === 'weekly') {
    schedules.forEach(schedule => {
      schedule.originalData.forEach(task => {
        const dayOfWeek = new Date(task.time).getDay();
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start (0 = Monday)

        // Count the task
        taskCounts[dayIndex]++;

        // Count completed tasks
        if (task.status === TaskStatus.COMPLETED) {
          completedCounts[dayIndex]++;

          // Check if task was completed on time
          if (task.completedAt) {
            const completedTime = new Date(task.completedAt);
            const scheduledEndTime = new Date(new Date(task.time).getTime() + task.duration * 60000);

            if (completedTime <= scheduledEndTime) {
              onTimeCounts[dayIndex]++;
            }
          }
        }

        // Add priority weight
        switch (task.priority) {
          case Priority.HIGH:
            priorityWeights[dayIndex] += 3;
            break;
          case Priority.MEDIUM:
            priorityWeights[dayIndex] += 2;
            break;
          case Priority.LOW:
            priorityWeights[dayIndex] += 1;
            break;
          default:
            priorityWeights[dayIndex] += 1;
        }
      });
    });
  } else { // Monthly
    schedules.forEach(schedule => {
      schedule.originalData.forEach(task => {
        const date = new Date(task.time);
        const dayOfMonth = date.getDate();
        let weekIndex = 0;

        if (dayOfMonth <= 7) weekIndex = 0;
        else if (dayOfMonth <= 14) weekIndex = 1;
        else if (dayOfMonth <= 21) weekIndex = 2;
        else weekIndex = 3;

        // Count the task
        taskCounts[weekIndex]++;

        // Count completed tasks
        if (task.status === TaskStatus.COMPLETED) {
          completedCounts[weekIndex]++;

          // Check if task was completed on time
          if (task.completedAt) {
            const completedTime = new Date(task.completedAt);
            const scheduledEndTime = new Date(date.getTime() + task.duration * 60000);

            if (completedTime <= scheduledEndTime) {
              onTimeCounts[weekIndex]++;
            }
          }
        }

        // Add priority weight
        switch (task.priority) {
          case Priority.HIGH:
            priorityWeights[weekIndex] += 3;
            break;
          case Priority.MEDIUM:
            priorityWeights[weekIndex] += 2;
            break;
          case Priority.LOW:
            priorityWeights[weekIndex] += 1;
            break;
          default:
            priorityWeights[weekIndex] += 1;
        }
      });
    });
  }

  // Calculate productivity score and completion rate
  const productivityScore = labels.map((_, index) => {
    if (taskCounts[index] === 0) return 0;

    // Calculate base completion percentage (0-100)
    const completionPercentage = (completedCounts[index] / taskCounts[index]) * 100;

    // Calculate on-time percentage (0-100)
    const onTimePercentage = completedCounts[index] > 0
      ? (onTimeCounts[index] / completedCounts[index]) * 100
      : 0;

    // Calculate priority efficiency (0-100)
    // Maximum possible priority points would be if all tasks were high priority (3 points each)
    const maxPossiblePriority = taskCounts[index] * 3;
    const priorityEfficiency = maxPossiblePriority > 0
      ? (priorityWeights[index] / maxPossiblePriority) * 100
      : 0;

    // Weighted productivity score calculation
    // 50% completion rate, 30% on-time rate, 20% priority efficiency
    const score = (completionPercentage * 0.5) + (onTimePercentage * 0.3) + (priorityEfficiency * 0.2);

    // Round to nearest integer
    return Math.round(score);
  });

  // Calculate completion rate (simpler metric - just % of tasks completed)
  const completionRate = labels.map((_, index) => {
    if (taskCounts[index] === 0) return 0;
    return Math.round((completedCounts[index] / taskCounts[index]) * 100);
  });

  return {
    labels,
    productivityScore,
    completionRate
  };
};

// Get streak data
export const getStreakData = async (userId: string): Promise<StreakData> => {
  const now = new Date();
  // We'll use this to get the last 7 days of data

  // Get all schedules for the last 30 days to calculate streaks
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      createdAt: {
        gte: subDays(now, 30)
      }
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      originalData: true
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Map of dates to completion status
  const dateCompletionMap = new Map<string, boolean>();

  // Process all schedules to build the date completion map
  schedules.forEach(schedule => {
    const date = schedule.createdAt.toISOString().split('T')[0];
    const completedTasks = schedule.originalData.filter(task => task.status === TaskStatus.COMPLETED).length;

    // Consider a day successful if at least one task was completed
    const isSuccessful = completedTasks > 0;
    dateCompletionMap.set(date, isSuccessful);
  });

  // Calculate streaks from the map
  const sortedDates = Array.from(dateCompletionMap.keys()).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    const isSuccessful = dateCompletionMap.get(sortedDates[i]);

    if (isSuccessful) {
      tempStreak++;

      // Check if this is the longest streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      // If this is the most recent date, update current streak
      if (i === sortedDates.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Get last seven days completion status
  const lastSevenDays: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i).toISOString().split('T')[0];
    lastSevenDays.push(dateCompletionMap.get(date) || false);
  }

  // Calculate adherence rate
  const totalDays = dateCompletionMap.size;
  const successfulDays = Array.from(dateCompletionMap.values()).filter(Boolean).length;
  const adherenceRate = totalDays > 0 ? Math.round((successfulDays / totalDays) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    adherenceRate,
    lastSevenDays
  };
};

// Get upcoming tasks
export const getUpcomingTasks = async (userId: string, limit: number = 5): Promise<any[]> => {
  const now = new Date();

  // Get the most recent schedule
  const latestSchedule = await prisma.schedule.findFirst({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      originalData: true
    }
  });

  if (!latestSchedule) {
    return [];
  }

  // Filter for upcoming tasks (status is PENDING and time is in the future)
  const upcomingTasks = latestSchedule.originalData
    .filter(task =>
      task.status === TaskStatus.PENDING &&
      new Date(task.time) > now
    )
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, limit);

  return upcomingTasks;
};

// Get most active hour
export const getMostActiveHour = async (userId: string): Promise<string> => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  // Get all schedules for the last 30 days
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    include: {
      originalData: {
        where: {
          status: TaskStatus.COMPLETED
        }
      }
    }
  });

  // Count tasks by hour
  const hourCounts = new Map<number, number>();

  schedules.forEach(schedule => {
    schedule.originalData.forEach(task => {
      const hour = new Date(task.time).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
  });

  // Find the hour with the most completed tasks
  let mostActiveHour = 9; // Default to 9am
  let maxCount = 0;

  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveHour = hour;
    }
  });

  // Format the hour
  const formattedHour = mostActiveHour === 0 ? '12 AM' :
                        mostActiveHour < 12 ? `${mostActiveHour} AM` :
                        mostActiveHour === 12 ? '12 PM' :
                        `${mostActiveHour - 12} PM`;

  return formattedHour;
};

// Get all dashboard data
export const getDashboardData = async (userId: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<DashboardData> => {
  const [
    taskStats,
    categoryBreakdown,
    taskCompletion,
    productivityTrend,
    streakData,
    upcomingTasks,
    mostActiveHour
  ] = await Promise.all([
    getTaskStats(userId, timeframe),
    getCategoryBreakdown(userId, timeframe),
    getTaskCompletionData(userId, timeframe),
    getProductivityTrend(userId, timeframe),
    getStreakData(userId),
    getUpcomingTasks(userId),
    getMostActiveHour(userId)
  ]);

  return {
    taskStats,
    categoryBreakdown,
    taskCompletion,
    productivityTrend,
    streakData,
    upcomingTasks,
    mostActiveHour
  };
};
