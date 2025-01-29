import { Request, Response } from 'express';
import { createUser , getAllUsers } from '../services/user.service';


// export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { email, name } = req.body;
  
//       if (!email || !name) {
//         res.status(400).json({ error: 'Email and name are required' });
//         return;
//       }
//       const newUser = await createUser({ email, name });
//       res.status(201).json(newUser);
//     } catch (error) {
//       console.error('Error creating user:', error);
//       res.status(500).json({ error: 'Failed to create user' });
//     }
//   };
  
  export const getAllUsersHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  };

  export const getCurrentUser = (req:Request,res:Response) : void =>{
    res.json({currentUser:req.user});
  };