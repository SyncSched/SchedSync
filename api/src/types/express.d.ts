//this is called as module augmentation and I don't know whether it's correct or not

import { AuthenticatedUser } from "./user";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
