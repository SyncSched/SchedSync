import { Prisma, PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { CreateScheduleInput, Task, Schedule } from '../models/schedule.model';
import { createScheduleSchema } from '../validations/schedule.schema';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Define the task select type
const taskSelect = {
  id: true,
  name: true,
  description: true,
  notes: true,
  time: true,
  duration: true,
  status: true,
  priority: true,
  location: true,
  scheduleId: true,
  isEmailEnabled: true,
  isWhatsAppEnabled: true,
  isTelegramEnabled: true,
  isCallEnabled: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  rescheduledTasks: true // Include the rescheduled tasks relation
} as const;

type TaskWithNotifications = Prisma.TaskGetPayload<{
  select: typeof taskSelect
}>;

// 2. Define return type
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: { user: true ;originalData:true };
}>;

const prisma = new PrismaClient();

function getTimezoneOffset(timezone: string, date: Date): number {
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  return (utcDate.getTime() - localDate.getTime()) / 60000; // Convert ms to minutes
}

// Helper function to convert HH:mm time string to a Date object
function convertTimeStringToDate(timeInput: string | Date): Date {
  // If it's already a Date object, return it
  if (timeInput instanceof Date) {
    return timeInput;
  }

  // If it's an ISO string with date and time (contains 'T')
  if (typeof timeInput === 'string' && timeInput.includes('T')) {
    return new Date(timeInput);
  }

  // If it's just a time string in HH:mm format
  if (typeof timeInput === 'string' && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)) {
    const [hours, minutes] = timeInput.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Default case - return current date
  console.warn(`Invalid time format: ${timeInput}, using current time`);
  return new Date();
}


export const createSchedule = async (
  input: CreateScheduleInput
): Promise<ScheduleWithRelations> => {
  const { userId, originalData } = input;

  const parsedInput = createScheduleSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(`Validation error: ${parsedInput.error.issues.map(issue => issue.message).join(", ")}`);
  }

  // Create schedule and tasks in a transaction
  return await prisma.$transaction(async (tx) => {
    // Get user for default notification settings
    const user = await tx.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // First, create the schedule with tasks
    const schedule = await tx.schedule.create({
      data: {
        userId,
        status: 'PENDING',
        originalData: {
          create: originalData.map((task) => ({
            name: task.name,
            description: task.description ?? "",
            notes: task.notes ?? "",
            time: new Date(convertTimeStringToDate(task.time)),
            duration: task.duration,
            status: TaskStatus.PENDING,
            priority: task.priority ?? Priority.MEDIUM,
            location: task.location ?? null,
            isEmailEnabled: task.isEmailEnabled ?? user.isEmailEnabled,
            isWhatsAppEnabled: task.isWhatsAppEnabled ?? user.isWhatsAppEnabled,
            isTelegramEnabled: task.isTelegramEnabled ?? user.isTelegramEnabled,
            isCallEnabled: task.isCallEnabled ?? user.isCallEnabled,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: null
          }))
        }
      },
      include: {
        user: true,
        originalData: {
          select: taskSelect
        }
      }
    });

    // Create notifications for each task
    for (const task of schedule.originalData) {
      const taskDate = new Date(task.time);
      const hours = taskDate.getHours();
      const minutes = taskDate.getMinutes();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      const notifyAt = new Date(scheduledTime.getTime() - (user.notifyBeforeMinutes * 60000));

      const notificationData = [];

      // Only create notifications if both user and task settings allow it
      if (task.isEmailEnabled && user.isEmailEnabled && user.email) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'email',
          notifyAt,
          status: 'pending'
        });
      }

      if (task.isWhatsAppEnabled && user.isWhatsAppEnabled && user.phoneNumber) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'whatsapp',
          notifyAt,
          status: 'pending'
        });
      }

      if (task.isTelegramEnabled && user.isTelegramEnabled && user.telegramChatId) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'telegram',
          notifyAt,
          status: 'pending'
        });
      }

      if (task.isCallEnabled && user.isCallEnabled && user.phoneNumber) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'call',
          notifyAt,
          status: 'pending'
        });
      }

      if (notificationData.length > 0) {
        await tx.taskNotification.createMany({
          data: notificationData
        });
      }
    }

    return schedule;
  });
};


export const getSchedule = async (
  date: string, // This is UTC date string from frontend
  userId: string,
  timezoneOffset: number // Offset in minutes
): Promise<Partial<Schedule>> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!date || isNaN(Date.parse(date))) {
    throw new Error("Invalid date format received");
  }

 // Since frontend sends UTC time, this is already in UTC
  const utcDate = new Date(date);

  // Determine user timezone and offset
  const userTimezone = user.timezone || 'UTC';
  const calculatedOffset = getTimezoneOffset(user.timezone, utcDate);

  // For a user in India (UTC+5:30) requesting April 11:
  // - localStartTime should be April 11, 18:30:00 UTC (which is April 12, 00:00:00 in India)
  // - localEndTime should be April 12, 18:29:59 UTC (which is April 13, 23:59:59 in India)

  // Create a new date object for the requested date
  const requestDate = new Date(utcDate);

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
  const localStartTime = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  // Adjust for timezone offset to get the correct UTC time
  // For India (UTC+5:30), we need to subtract 5.5 hours from local midnight to get UTC time
  localStartTime.setUTCMinutes(localStartTime.getUTCMinutes() + calculatedOffset);

  // Create the end time (23:59:59.999) in the user's local timezone
  // This is exactly 24 hours after the start time, minus 1 millisecond
  const localEndTime = new Date(localStartTime);
  localEndTime.setUTCHours(localEndTime.getUTCHours() + 24);
  localEndTime.setUTCMilliseconds(localEndTime.getUTCMilliseconds() - 1);

  console.log('Schedule Query Range:', {
    userTimezone,
    calculatedOffset,
    date,
    localStartTime: localStartTime.toISOString(),
    localEndTime: localEndTime.toISOString(),
  });

  console.log("Node.js Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log("Current UTC Time:", new Date().toISOString());

  // Find the schedule for the requested UTC date
  const schedule = await prisma.schedule.findFirst({
    where: {
      userId: userId,
      createdAt: {
        gte: localStartTime, // 00:00 UTC
        lt: localEndTime,    // 00:00 UTC next day
      },
    },
    include: {
      user: true,
      originalData: {
        select: taskSelect,
        orderBy: {
          time: 'asc'
        }
      },
    },
  });

  if (schedule) {
    // Sort tasks by time before returning
    schedule.originalData = schedule.originalData
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        notes: task.notes,
        time: task.time,
        duration: task.duration,
        status: task.status,
        priority: task.priority,
        location: task.location,
        scheduleId: task.scheduleId,
        isEmailEnabled: task.isEmailEnabled,
        isWhatsAppEnabled: task.isWhatsAppEnabled,
        isTelegramEnabled: task.isTelegramEnabled,
        isCallEnabled: task.isCallEnabled,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        rescheduledTasks: task.rescheduledTasks
      }));
  }

  // If no schedule found, return a specific error
  if (!schedule) {
    // Create a custom error that can be caught by the controller
    // This will trigger schedule generation on the client side
    const error = new Error("No schedule found for the requested date. Please generate a new schedule.");
    (error as any).code = 'SCHEDULE_NOT_FOUND';
    throw error;
  }

  // Return the found schedule
  return {
    ...schedule,
    originalData: schedule.originalData.map((task: TaskWithNotifications) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      notes: task.notes,
      time: task.time,
      duration: task.duration,
      status: task.status,
      priority: task.priority,
      location: task.location,
      scheduleId: task.scheduleId,
      isEmailEnabled: task.isEmailEnabled,
      isWhatsAppEnabled: task.isWhatsAppEnabled,
      isTelegramEnabled: task.isTelegramEnabled,
      isCallEnabled: task.isCallEnabled,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      rescheduledTasks: task.rescheduledTasks
    }))
  };
};


/**
 * Get all schedules for an entire week regardless of status
 */
export const getWeekSchedule = async (
  startDate: string, // Start date of the week (UTC date string)
  endDate: string,   // End date of the week (UTC date string)
  userId: string,
  timezoneOffset: number // Offset in minutes
): Promise<Partial<Schedule>[]> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
    throw new Error("Invalid date format received");
  }

  // Convert to Date objects - these are in UTC
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Determine user timezone and offset
  const userTimezone = user.timezone || 'UTC';

  // Calculate the timezone offset for the user
  const calculatedOffset = getTimezoneOffset(userTimezone, startDateObj);

  // Adjust start date for timezone
  // Create a formatter to get the date in user's timezone
  const startFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Get the date parts for start date in the user's timezone
  const startDateParts = startFormatter.formatToParts(startDateObj);
  const startYear = parseInt(startDateParts.find(part => part.type === 'year')?.value || '2025');
  const startMonth = parseInt(startDateParts.find(part => part.type === 'month')?.value || '01') - 1; // Month is 0-indexed
  const startDay = parseInt(startDateParts.find(part => part.type === 'day')?.value || '01');

  // Create the adjusted start time in UTC
  const adjustedStartDate = new Date(Date.UTC(startYear, startMonth, startDay, 0, 0, 0, 0));
  adjustedStartDate.setUTCMinutes(adjustedStartDate.getUTCMinutes() + calculatedOffset);

  // Adjust end date for timezone
  const endFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Get the date parts for end date in the user's timezone
  const endDateParts = endFormatter.formatToParts(endDateObj);
  const endYear = parseInt(endDateParts.find(part => part.type === 'year')?.value || '2025');
  const endMonth = parseInt(endDateParts.find(part => part.type === 'month')?.value || '01') - 1; // Month is 0-indexed
  const endDay = parseInt(endDateParts.find(part => part.type === 'day')?.value || '01');

  // Create the adjusted end time in UTC
  const adjustedEndDate = new Date(Date.UTC(endYear, endMonth, endDay, 23, 59, 59, 999));
  adjustedEndDate.setUTCMinutes(adjustedEndDate.getUTCMinutes() + calculatedOffset);

  console.log('Week Schedule Query Range:', {
    userTimezone,
    calculatedOffset,
    originalStartDate: startDateObj.toISOString(),
    originalEndDate: endDateObj.toISOString(),
    adjustedStartDate: adjustedStartDate.toISOString(),
    adjustedEndDate: adjustedEndDate.toISOString(),
  });

  // First, find all schedules for this user
  const allUserSchedules = await prisma.schedule.findMany({
    where: {
      userId: userId,
      // Removed status filter to get all schedules regardless of status
    },
    include: {
      user: true,
      originalData: {
        select: taskSelect,
      },
    },
  });

  // Filter schedules that have tasks within the date range
  const schedulesWithTasksInRange = allUserSchedules.filter(schedule => {
    // Check if any task in this schedule falls within our date range
    return schedule.originalData.some(task => {
      const taskDate = new Date(task.time);
      return taskDate >= adjustedStartDate && taskDate <= adjustedEndDate;
    });
  });

  console.log(`Found ${schedulesWithTasksInRange.length} schedules with tasks in the date range (all statuses)`);

  // If no schedules found, return empty array
  if (!schedulesWithTasksInRange || schedulesWithTasksInRange.length === 0) {
    return [];
  }

  // Process and return the schedules
  return schedulesWithTasksInRange.map(schedule => ({
    ...schedule,
    originalData: schedule.originalData
      // Filter tasks to only include those within the date range
      .filter(task => {
        const taskDate = new Date(task.time);
        return taskDate >= adjustedStartDate && taskDate <= adjustedEndDate;
      })
      // Sort tasks by time
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      // Map to the expected format
      .map((task: TaskWithNotifications) => ({
        id: task.id,
        name: task.name,
        description: task.description,
        notes: task.notes,
        time: task.time,
        duration: task.duration,
        status: task.status,
        priority: task.priority,
        location: task.location,
        scheduleId: task.scheduleId,
        isEmailEnabled: task.isEmailEnabled,
        isWhatsAppEnabled: task.isWhatsAppEnabled,
        isTelegramEnabled: task.isTelegramEnabled,
        isCallEnabled: task.isCallEnabled,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        rescheduledTasks: task.rescheduledTasks
      }))
  }));
};

export const updateSchedule = async (
  scheduleId: string,
  data: { originalData: Task[] }
): Promise<ScheduleWithRelations> => {
  if (!scheduleId) {
    throw new Error('Schedule ID is required');
  }

  return await prisma.$transaction(async (tx) => {
    // First, get existing tasks
    const existingTasks = await tx.task.findMany({
      where: { scheduleId }
    });

    // Create sets of task IDs for comparison
    const existingTaskIds = new Set(existingTasks.map(task => task.id));
    const newTaskIds = new Set(data.originalData.map(task => task.id));

    // Find tasks to delete (exist in DB but not in new data)
    const tasksToDelete = existingTasks.filter(task => !newTaskIds.has(task.id));

    if (tasksToDelete.length > 0) {
      // Delete notifications for removed tasks
      await tx.taskNotification.deleteMany({
        where: {
          taskId: {
            in: tasksToDelete.map(task => task.id)
          }
        }
      });

      // Delete removed tasks
      await tx.task.deleteMany({
        where: {
          id: {
            in: tasksToDelete.map(task => task.id)
          }
        }
      });
    }

    // Update existing tasks and create new ones
    const taskOperations = data.originalData.map(task => {
      if (existingTaskIds.has(task.id)) {
        // Update existing task
        return tx.task.update({
          where: { id: task.id },
          data: {
            name: task.name,
            description: task.description,
            notes: task.notes,
            time: typeof task.time === 'string' ? new Date(convertTimeStringToDate(task.time)) : task.time,
            duration: task.duration,
            status: task.status,
            priority: task.priority,
            location: task.location,
            isEmailEnabled: task.isEmailEnabled,
            isWhatsAppEnabled: task.isWhatsAppEnabled,
            isTelegramEnabled: task.isTelegramEnabled,
            isCallEnabled: task.isCallEnabled
          }
        });
      } else {
        // Create new task
        return tx.task.create({
          data: {
            name: task.name,
            description: task.description,
            notes: task.notes,
            time: typeof task.time === 'string' ? new Date(convertTimeStringToDate(task.time)) : task.time,
            duration: task.duration,
            status: 'PENDING',
            priority: task.priority,
            location: task.location,
            isEmailEnabled: task.isEmailEnabled,
            isWhatsAppEnabled: task.isWhatsAppEnabled,
            isTelegramEnabled: task.isTelegramEnabled,
            isCallEnabled: task.isCallEnabled,
            scheduleId
          }
        });
      }
    });

    // Execute all task operations
    await Promise.all(taskOperations);

    // Update schedule and get updated data
    const schedule = await tx.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        user: true,
        originalData: true
      }
    });

    if (!schedule || !schedule.user) {
      throw new Error('Schedule or user not found');
    }

    // Get existing notifications for comparison
    const existingNotifications = await tx.taskNotification.findMany({
      where: {
        taskId: {
          in: schedule.originalData.map(task => task.id)
        },
        status: 'pending'
      }
    });

    // For each task, check if time or notification settings changed
    for (const task of schedule.originalData) {
      const existingTask = existingTasks.find(et => et.id === task.id);

      // Check if task time or notification settings changed
      const timeChanged = existingTask &&
        new Date(existingTask.time).getTime() !== new Date(task.time).getTime();
      const settingsChanged = existingTask && (
        existingTask.isEmailEnabled !== task.isEmailEnabled ||
        existingTask.isWhatsAppEnabled !== task.isWhatsAppEnabled ||
        existingTask.isTelegramEnabled !== task.isTelegramEnabled ||
        existingTask.isCallEnabled !== task.isCallEnabled
      );


      // Only update notifications if task is new or has changes
      if (!existingTask || timeChanged || settingsChanged) {
        // Mark existing notifications as cancelled
        const taskNotifications = existingNotifications.filter(n => n.taskId === task.id);
        if (taskNotifications.length > 0) {
          await tx.taskNotification.updateMany({
            where: {
              id: {
                in: taskNotifications.map(n => n.id)
              }
            },
            data: {
              status: 'cancelled'
            }
          });
        }

        // Create new notifications
        const taskDate = new Date(task.time);
        const hours = taskDate.getHours();
        const minutes = taskDate.getMinutes();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        const notifyAt = new Date(scheduledTime.getTime() - (schedule.user.notifyBeforeMinutes * 60000));

        const notificationData = [];

        if (schedule.user.isEmailEnabled && schedule.user.email && task.isEmailEnabled) {
          notificationData.push({
            taskId: task.id,
            userId: schedule.user.id,
            channel: 'email',
            notifyAt,
            status: 'pending'
          });
        }

        if (schedule.user.isWhatsAppEnabled && schedule.user.phoneNumber && task.isWhatsAppEnabled) {
          notificationData.push({
            taskId: task.id,
            userId: schedule.user.id,
            channel: 'whatsapp',
            notifyAt,
            status: 'pending'
          });
        }

        if (schedule.user.isTelegramEnabled && schedule.user.telegramChatId && task.isTelegramEnabled) {
          notificationData.push({
            taskId: task.id,
            userId: schedule.user.id,
            channel: 'telegram',
            notifyAt,
            status: 'pending'
          });
        }

        if (schedule.user.isCallEnabled && schedule.user.phoneNumber && task.isCallEnabled) {
          notificationData.push({
            taskId: task.id,
            userId: schedule.user.id,
            channel: 'call',
            notifyAt,
            status: 'pending'
          });
        }

        if (notificationData.length > 0) {
          await tx.taskNotification.createMany({
            data: notificationData
          });
        }
      }
    }

    return schedule;
  });
};


export const getTodaySchedules = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        user: true, // Include user information
        originalData: true, // Include tasks
      }
    });

    return schedules;
  } catch (error) {
    console.error('Error fetching today schedules:', error);
    throw error;
  }
};
