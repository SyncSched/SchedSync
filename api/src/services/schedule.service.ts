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
  completedAt: true
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

async function createNotificationsForTask(taskId: string, userId: string, taskTime: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Convert task time string to Date object
    const taskDate = new Date(taskTime);
    const hours = taskDate.getHours();
    const minutes = taskDate.getMinutes();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Calculate notification time based on user's preference
    const notifyAt = new Date(scheduledTime.getTime() - (user.notifyBeforeMinutes * 60000));

    // Create notifications for each enabled channel
    const notifications = [];

    if (user.isEmailEnabled && user.email) {
      notifications.push({
        taskId,
        userId,
        channel: 'email',
        notifyAt
      });
    }

    if (user.isWhatsAppEnabled && user.phoneNumber) {
      notifications.push({
        taskId,
        userId,
        channel: 'whatsapp',
        notifyAt
      });
    }

    if (user.isTelegramEnabled && user.telegramChatId) {
      notifications.push({
        taskId,
        userId,
        channel: 'telegram',
        notifyAt
      });
    }

    if (user.isCallEnabled && user.phoneNumber) {
      notifications.push({
        taskId,
        userId,
        channel: 'call',
        notifyAt
      });
    }

    // Bulk create all notifications
    if (notifications.length > 0) {
      await prisma.taskNotification.createMany({
        data: notifications
      });
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
    throw error;
  }
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
            time: task.time,
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
        completedAt: task.completedAt
      }));
  }

  // If no schedule found and it's the start of a new day, we need to create one
  if (!schedule) {
    // Get the user's previous schedule to use as a template
    const previousSchedule = await prisma.schedule.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        originalData: {
          select: taskSelect,
          orderBy: {
            time: 'asc'  // Sort tasks by time in ascending order
          }
        }
      }
    });

    // If there's a previous schedule, create a new one based on it
    if (previousSchedule) {
      // Create task data based on previous schedule's tasks
      const taskData = previousSchedule.originalData.map(task => {
        return {
          name: task.name,
          time: task.time,
          duration: task.duration,
          isEmailEnabled: task.isEmailEnabled,
          isWhatsAppEnabled: task.isWhatsAppEnabled,
          isTelegramEnabled: task.isTelegramEnabled,
          isCallEnabled: task.isCallEnabled
        } as Task; // Cast to Task to satisfy TypeScript
      });

      // Create the input with the properly typed tasks
      const createInput: CreateScheduleInput = {
        userId,
        originalData: taskData
      };

      // Create a new schedule using the existing function
      const newSchedule = await createSchedule(createInput);

      return {
        ...newSchedule,
        originalData: newSchedule.originalData.map((task: TaskWithNotifications) => ({
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
          completedAt: task.completedAt
        }))
      };
    } else {
      throw new Error("No previous schedule found to use as template");
    }
  } else if (!schedule) {
    throw new Error("No schedule found for the requested date");
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
      completedAt: task.completedAt
    }))
  };
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
            time: task.time,
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
            time: task.time,
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
