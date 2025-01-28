
import { PrismaClient } from '@prisma/client';
import { CreateUserInput, User } from '../models/user.model';


const prisma = new PrismaClient();

export const createUser = async (data: CreateUserInput): Promise<User | null> => {
  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }, // Assuming `email` is unique
  });

  // If the user exists, return null or the existing user
  if (existingUser) {
    console.log('User already exists:', existingUser);
    return existingUser; // or return existingUser;
  }

  // If the user doesn't exist, create a new user
  return prisma.user.create({
    data,
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};