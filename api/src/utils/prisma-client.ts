import { PrismaClient } from '@prisma/client';

// Create a shared Prisma client with increased transaction timeout
export const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 15000, // 15 seconds max wait time
    timeout: 15000   // 15 seconds timeout
  }
});

export default prisma;
