import {createUserHandler,getAllUsersHandler} from '../controllers/user.controller'

export const attachPublicRoutes = (app:any) : void =>{

}

export const attachPrivateRoutes = (app:any) :void =>{
    app.post('/users',createUserHandler);
    app.get('/users',getAllUsersHandler);
}