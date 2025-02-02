import { createAdjustmentHandler } from '../controllers/adjustment.controller';
import { createScheduleHandler, getScheduleHandler } from '../controllers/schedule.controller';
import {getAllUsersHandler, getCurrentUser} from '../controllers/user.controller'

export const attachPublicRoutes = (app:any) : void =>{

}

export const attachPrivateRoutes = (app:any) :void =>{
    
    app.get('/users',getAllUsersHandler); //This route is not required but working fine
    
    app.get('/currentUser',getCurrentUser);

    app.post('/getSchedule',getScheduleHandler);
    //create a Schedule  -> Here we call AI to schedule that day , call only once per day , whenever person opens the website
    app.post('/createSchedule',createScheduleHandler);

    //create a Adjustment -> We store all these adjustments in Vector DBs inorder to retrive the matched information
    app.post('/createAdjustment',createAdjustmentHandler);

}