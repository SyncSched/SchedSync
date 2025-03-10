import { updateRemainderSettings } from '../controllers/notification.controller';
import { checkOnboardingDataHandler, createOnboardingHandler } from '../controllers/onboarding.controller';
import { createScheduleHandler, generateScheduleHandler, getScheduleHandler , updateScheduleHandler } from '../controllers/schedule.controller';
import {getAllUsersHandler, getCurrentUser} from '../controllers/user.controller';
import { updateTaskNotificationSettings } from '../controllers/task.controller';

export const attachPublicRoutes = (app:any) : void =>{
    app.get('/users',getAllUsersHandler); //This route is not required but working fine
}

export const attachPrivateRoutes = (app:any) :void =>{
    
    
    app.get('/currentUser',getCurrentUser);
    
    app.post('/getSchedule',getScheduleHandler);
    //create a Schedule  -> Here we call AI to schedule that day , call only once per day , whenever person opens the website
    app.get('/generateSchedule' , generateScheduleHandler);
    app.post('/createSchedule',createScheduleHandler);

    app.post('/createOnboarding', createOnboardingHandler);

    app.get('/checkonboardingdata', checkOnboardingDataHandler);

    app.put('/schedule/:id/update', updateScheduleHandler);
    app.put("/notifications/:userId", updateRemainderSettings);

    app.patch('/task/:taskId/notifications', updateTaskNotificationSettings);
}
