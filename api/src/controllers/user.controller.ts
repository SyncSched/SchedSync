import { Request, Response } from 'express';
import { getAllUsers } from '../services/user.service';
import { AuthenticatedRequest } from '../types/request';
  
  export const getAllUsersHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  };

  export const getCurrentUser = (req:AuthenticatedRequest,res:Response) : void =>{
    res.json({currentUser:req.user});
  };