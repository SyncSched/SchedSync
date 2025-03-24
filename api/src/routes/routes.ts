import { updateRemainderSettings } from '../controllers/notification.controller';
import { checkOnboardingDataHandler, createOnboardingHandler } from '../controllers/onboarding.controller';
import { createScheduleHandler, generateScheduleHandler, getScheduleHandler, updateScheduleHandler } from '../controllers/schedule.controller';
import { getAllUsersHandler, getCurrentUser, updateUserTimezoneHandler } from '../controllers/user.controller';
import { updateTaskNotificationSettings } from '../controllers/task.controller';

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
}
