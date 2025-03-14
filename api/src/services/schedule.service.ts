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

  // Create UTC midnight
  const utcMidnight = new Date();
  utcMidnight.setUTCHours(0, 0, 0, 0);
  
  // Add timezone offset to get UTC time corresponding to user's local midnight
  const userLocalMidnightInUTC = new Date(utcMidnight.getTime() + (timezoneOffset * 60000));

  console.log(userLocalMidnightInUTC,"#################")
  const schedule = await prisma.schedule.findFirst({
    where: {
      userId: userId,
      createdAt: {
        gte: userLocalMidnightInUTC
      },
    },
    include: {
      user: true,
      originalData: {
        select: taskSelect
      },
    },
  });
  
  if (!schedule) {
    throw new Error("No Schedule found for today, so we are generating the Schedule for today");
  }

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
    // First delete existing notifications and tasks
    await tx.taskNotification.deleteMany({
      where: {
        task: {
          scheduleId
        }
      }
    });

    await tx.task.deleteMany({
      where: {
        scheduleId
      }
    });

    // Create new tasks
    const schedule = await tx.schedule.update({
      where: { id: scheduleId },
      data: {
        originalData: {
          create: data.originalData.map(task => ({
            name: task.name,
            time: task.time,
            duration: task.duration,
            isEmailEnabled: task.isEmailEnabled,
            isWhatsAppEnabled: task.isWhatsAppEnabled,
            isTelegramEnabled: task.isTelegramEnabled,
            isCallEnabled: task.isCallEnabled
          }))
        }
      },
      include: {
        user: true,
        originalData: true
      }
    });

    // Get user details
    const user = await tx.user.findUnique({
      where: { id: schedule.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create new notifications for each task
    for (const task of schedule.originalData) {
      const [hours, minutes] = task.time.split(':').map(Number);
      const taskDateTime = new Date();
      taskDateTime.setHours(hours, minutes, 0, 0);
      const notifyAt = new Date(taskDateTime.getTime() - (user.notifyBeforeMinutes * 60000));

      const notificationData = [];

      if (user.isEmailEnabled && user.email) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'email',
          notifyAt,
          status: 'pending'
        });
      }

      if (user.isWhatsAppEnabled && user.phoneNumber) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'whatsapp',
          notifyAt,
          status: 'pending'
        });
      }

      if (user.isTelegramEnabled && user.telegramChatId) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'telegram',
          notifyAt,
          status: 'pending'
        });
      }

      if (user.isCallEnabled && user.phoneNumber) {
        notificationData.push({
          taskId: task.id,
          userId: user.id,
          channel: 'call',
          notifyAt,
          status: 'pending'
        });
      }

      if (notificationData.length > 0) {
        for (const notification of notificationData) {
          await tx.taskNotification.create({
            data: notification
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
