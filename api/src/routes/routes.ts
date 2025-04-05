import { updateRemainderSettings } from '../controllers/notification.controller';
import { checkOnboardingDataHandler, createOnboardingHandler } from '../controllers/onboarding.controller';
import { createScheduleHandler, generateScheduleHandler, getScheduleHandler, updateScheduleHandler } from '../controllers/schedule.controller';
import {
    getAllUsersHandler,
    getCurrentUser,
    updateUserTimezoneHandler,
    updateUserSettingsHandler,
    getUserSettingsHandler
} from '../controllers/user.controller';
import { updateTaskNotificationSettings } from '../controllers/task.controller';
import { getUpcomingNotificationsHandler , updateNotificationTimeHandler, deleteNotificationHandler } from '../controllers/notification.controller';
import { getTelegramAuthLink } from '../controllers/notification.controller';
import { telegramWebhookHandler, setTelegramWebhook } from '../controllers/telegram.controller';

export const attachPublicRoutes = (app: any): void => {
    app.get('/users', getAllUsersHandler);

    // Telegram webhook endpoint (needs to be public to receive updates from Telegram)
    app.post('/telegram/webhook', telegramWebhookHandler);
}

export const attachPrivateRoutes = (app: any): void => {
    app.get('/currentUser', getCurrentUser);

    app.post('/getSchedule', getScheduleHandler);
    app.post('/generateSchedule', generateScheduleHandler);
    app.post('/createSchedule', createScheduleHandler);

    app.post('/createOnboarding', createOnboardingHandler);

    app.get('/checkonboardingdata', checkOnboardingDataHandler);

    app.put('/schedule/:id/update', updateScheduleHandler);
    app.put("/notifications/:userId", updateRemainderSettings);

    app.patch('/task/:taskId/notifications', updateTaskNotificationSettings);

    // User settings routes
    app.get('/user/settings', getUserSettingsHandler);
    app.put('/user/settings', updateUserSettingsHandler);
    app.put('/user/timezone', updateUserTimezoneHandler);

    // Notification routes
    app.get('/notifications/upcoming', getUpcomingNotificationsHandler);
    app.put('/notifications/:notificationId', updateNotificationTimeHandler);
    app.delete('/notifications/:notificationId', deleteNotificationHandler);

    // Telegram routes
    app.get('/users/:userId/telegram-auth', getTelegramAuthLink);
    app.post('/telegram/set-webhook', setTelegramWebhook);
}
