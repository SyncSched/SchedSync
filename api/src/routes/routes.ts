import { updateRemainderSettings } from '../controllers/notification.controller';
import { checkOnboardingDataHandler, createOnboardingHandler } from '../controllers/onboarding.controller';
import { createScheduleHandler, generateScheduleHandler, getScheduleHandler, updateScheduleHandler } from '../controllers/schedule.controller';
import { getAllUsersHandler, getCurrentUser, updateUserTimezoneHandler, updateUserSettingsHandler } from '../controllers/user.controller';
import { updateTaskNotificationSettings } from '../controllers/task.controller';
import { getUpcomingNotificationsHandler , updateNotificationTimeHandler, deleteNotificationHandler } from '../controllers/notification.controller';

export const attachPublicRoutes = (app: any): void => {
    app.get('/users', getAllUsersHandler);
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

    app.put('/user/timezone', updateUserTimezoneHandler);
    app.put('/user/settings', updateUserSettingsHandler);

    // Notification routes
    app.get('/notifications/upcoming', getUpcomingNotificationsHandler);
    app.put('/notifications/:notificationId', updateNotificationTimeHandler);
    app.delete('/notifications/:notificationId', deleteNotificationHandler);
}
