
import { PrismaClient } from '@prisma/client';
import { CreateUserInput, User } from '../models/user.model';


const prisma = new PrismaClient();

export const createUser = async (data: CreateUserInput): Promise<User | null> => {
  
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    console.log('User already exists:', existingUser);
    return existingUser; 
  }

  return prisma.user.create({
    data,
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};