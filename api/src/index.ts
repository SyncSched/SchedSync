import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Middleware to parse JSON requests

const PORT = 3000;

// Add a new user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const newUser = await prisma.user.create({
      data: { email, name },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});