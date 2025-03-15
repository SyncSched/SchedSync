import { Prisma, PrismaClient } from '@prisma/client';
import { CreateScheduleInput, Task, Schedule } from '../models/schedule.model';
import { createScheduleSchema } from '../validations/schedule.schema';

// Define the task select type
const taskSelect = {
  id: true,
  name: true,
  time: true,
  duration: true,
  scheduleId: true,
  isEmailEnabled: true,
  isWhatsAppEnabled: true,
  isTelegramEnabled: true,
  isCallEnabled: true
} as const;

type TaskWithNotifications = Prisma.TaskGetPayload<{
  select: typeof taskSelect
}>;

// 2. Define return type
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: { user: true ;originalData:true };
}>;

const prisma = new PrismaClient();


async function createNotificationsForTask(taskId: string, userId: string, taskTime: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Convert task time string to Date object
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date();
    taskDateTime.setHours(hours, minutes, 0, 0);

    // Calculate notification time based on user's preference
    const notifyAt = new Date(taskDateTime.getTime() - (user.notifyBeforeMinutes * 60000));

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
        status: 'completed',
        originalData: {
          create: originalData.map((task: Task) => ({
            name: task.name,
            time: task.time,
            duration: task.duration,
            // Use task-specific settings if provided, otherwise use user defaults
            isEmailEnabled: task.isEmailEnabled ?? user.isEmailEnabled,
            isWhatsAppEnabled: task.isWhatsAppEnabled ?? user.isWhatsAppEnabled,
            isTelegramEnabled: task.isTelegramEnabled ?? user.isTelegramEnabled,
            isCallEnabled: task.isCallEnabled ?? user.isCallEnabled
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
      const [hours, minutes] = task.time.split(':').map(Number);
      const taskDateTime = new Date();
      taskDateTime.setHours(hours, minutes, 0, 0);
      const notifyAt = new Date(taskDateTime.getTime() - (user.notifyBeforeMinutes * 60000));

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
  date: string,
  userId: string,
  timezoneOffset: number
): Promise<Partial<Schedule>> => {
  if (!date || isNaN(Date.parse(date))) {
    throw new Error("Invalid date format received");
  }

  // Parse the date string to create a Date object for the requested date
  const requestedDate = new Date(date);
  
  // Convert to user's local midnight by adjusting for timezone offset
  // First, set the time to midnight in UTC
  requestedDate.setUTCHours(0, 0, 0, 0);
  
  // Then adjust for the user's timezone offset
  const userLocalMidnight = new Date(requestedDate.getTime() - (timezoneOffset * 60000));
  
  // Calculate the end of the day (next day's midnight)
  const nextDay = new Date(userLocalMidnight);
  nextDay.setDate(nextDay.getDate() + 1);
  
  console.log('Date Range:', userLocalMidnight, nextDay, "Timezone Offset:", timezoneOffset);
  
  // Check if the user's local time is 12 AM (start of a new day)
  const now = new Date();
  const userLocalTime = new Date(now.getTime() - (timezoneOffset * 60000));
  const isStartOfDay = userLocalTime.getHours() === 0 && 
                       userLocalTime.getMinutes() < 5; // Give a small buffer of 5 minutes
  
  // Find the schedule for the requested date
  const schedule = await prisma.schedule.findFirst({
    where: {
      userId: userId,
      createdAt: {
        gte: userLocalMidnight,
        lt: nextDay
      },
    },
    include: {
      user: true,
      originalData: {
        select: taskSelect
      },
    },
  });
  
  // If no schedule found and it's the start of a new day, we need to create one
  if (!schedule && isStartOfDay) {
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
          select: taskSelect
        }
      }
    });
    
    // If there's a previous schedule, create a new one based on it
    if (previousSchedule) {
      // Create task data based on previous schedule's tasks
      // We need to create proper Task objects that match the expected type
      const taskData = previousSchedule.originalData.map(task => {
        // Create a task object that matches the Task interface
        // We're creating a new task, so we omit id and scheduleId which will be generated
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
          time: task.time,
          duration: task.duration,
          scheduleId: task.scheduleId,
          isEmailEnabled: task.isEmailEnabled,
          isWhatsAppEnabled: task.isWhatsAppEnabled,
          isTelegramEnabled: task.isTelegramEnabled,
          isCallEnabled: task.isCallEnabled
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
      time: task.time,
      duration: task.duration,
      scheduleId: task.scheduleId,
      isEmailEnabled: task.isEmailEnabled,
      isWhatsAppEnabled: task.isWhatsAppEnabled,
      isTelegramEnabled: task.isTelegramEnabled,
      isCallEnabled: task.isCallEnabled
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
            time: task.time,
            duration: task.duration,
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
            time: task.time,
            duration: task.duration,
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
      const timeChanged = existingTask && existingTask.time !== task.time;
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
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskDateTime = new Date();
        taskDateTime.setHours(hours, minutes, 0, 0);
        const notifyAt = new Date(taskDateTime.getTime() - (schedule.user.notifyBeforeMinutes * 60000));

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
