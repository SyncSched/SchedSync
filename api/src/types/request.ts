import { Request } from "express";
import { AuthenticatedUser } from "./user";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
