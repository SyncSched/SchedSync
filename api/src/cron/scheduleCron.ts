import cron from 'node-cron';
import { storeDailySchedules } from '../workflow';
import { prisma } from '../utils/prisma-client';

export async function processUserSchedules() {
  try {
    // Get all unique timezones where it's currently 23:30
    const users = await prisma.user.findMany({
      select: {
        id: true,
        timezone: true
      },
      distinct: ['timezone']
    });

    for (const user of users) {
      const timezone = user.timezone || 'UTC';

      // Check if it's 23:30 in this timezone
      const userTime = new Date().toLocaleString('en-US', { timeZone: timezone });
      const userDateTime = new Date(userTime);
      if (userDateTime.getHours() === 23 && userDateTime.getMinutes() >= 30 && userDateTime.getMinutes() < 35) {
        // Get schedules for users in this timezone
        const todaySchedules = await prisma.schedule.findMany({
          where: {
            user: {
              timezone: timezone
            },
            createdAt: {
              gte: new Date(userDateTime.setHours(0, 0, 0, 0)),
              lt: new Date(userDateTime.setHours(23, 59, 59, 999))
            }
          },
          include: {
            user: {
              include: {
                onboardingData: true
              }
            },
            originalData: true
          }
        });


        for (const schedule of todaySchedules) {
          if (!schedule.user) {
            console.error(`User not found for schedule: ${schedule.id}`);
            continue;
          }

          await storeDailySchedules(
            schedule.userId.toString(),
            JSON.stringify(schedule),
            schedule.user
          );
        }
      }
    }
  } catch (error) {
    console.error('Error processing daily schedules:', error);
    throw error;
  }
}

// Initialize cron jobs for local development
export const initLocalScheduleCron = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await processUserSchedules();
    } catch (error) {
      console.error('Error in local schedule cron:', error);
    }
  });
}
