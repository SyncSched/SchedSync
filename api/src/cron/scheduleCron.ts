import cron from 'node-cron';
import { storeDailySchedules } from '../workflow';
import { getTodaySchedules } from '../services/schedule.service';

async function processUserSchedules() {
  try {
    // Fetch all schedules created today from PostgreSQL
    const todaySchedules = await getTodaySchedules();
    console.log(todaySchedules,"today Schedules")
    for (const schedule of todaySchedules) {
      // Store each schedule in the vector database
      await storeDailySchedules(
        schedule.userId.toString(),
        JSON.stringify(schedule)
      );
    }

    console.log(`Processed ${todaySchedules.length} schedules`);
  } catch (error) {
    console.error('Error processing daily schedules:', error);
  }
}

// Schedule the cron job to run at 11:30 PM every day
export const initScheduleCron = () => {
  cron.schedule('30 23 * * *', async () => {
    console.log('Running daily schedule storage job');
    await processUserSchedules();
  });

};
