// import { User as PrismaUser } from "@prisma/client";

// export type AuthenticatedUser = PrismaUser;


export interface AuthenticatedUser {
    id: string; // User ID
    email: string; // User email
    name: string;
    avatarUrl: string;
}
  