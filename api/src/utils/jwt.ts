import jwt from 'jsonwebtoken';

// Define a secret key for signing JWTs (store this securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define the payload type for the JWT
interface JwtPayload {
  id: string; // User ID
  email: string; // User email
  name: string;
  avatarUrl: string;
}

// Function to generate a JWT
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // Token expires in 1 hour
  });
};

// Function to verify a JWT
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};