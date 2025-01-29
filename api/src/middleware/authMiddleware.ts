import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { InvalidTokenError } from '../errors';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    throw new InvalidTokenError("No token Provided");
    // return res.status(401).json({ message: 'No token provided.' });
  }

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new InvalidTokenError("Authentication Token is not valid or Expired");
    // return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  // Attach the decoded payload to the request object
  req.user = decoded;
  next();
};