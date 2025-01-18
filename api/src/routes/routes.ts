import { Router } from 'express';
import {createUserHandler,getAllUsersHandler} from '../controllers/user.controller'


const router = Router();

router.post('/users', createUserHandler);
router.get('/users', getAllUsersHandler);


export default router;