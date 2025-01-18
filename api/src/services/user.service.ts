
import { PrismaClient } from '@prisma/client';
import { User } from '../models/user.model';


const prisma = new PrismaClient();

export const createUser = async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  return prisma.user.create({
    data,
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};