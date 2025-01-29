import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { createUser } from '../services/user.service'; // Import the createUser function

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a type for the Google profile
interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

// Configure the Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
      console.log(profile, 'profile');
      try {
        // Extract relevant data from the Google profile
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        // Validate email before proceeding
        if (!email || !avatarUrl) {
          return done(new Error('No email found for Google account.'));
        }

        // Prepare user data for creation
        const userData = {
          googleId: profile.id,
          email,
          name: profile.displayName,
          avatarUrl: avatarUrl,
        };

        // Use the createUser function to create or fetch the user
        const user = await createUser(userData);

        if (!user) {
          return done(new Error('User already exists or could not be created.'));
        }

        return done(null, user);
      } catch (error) {
        console.error('Error during Google authentication:', error);
        return done(error);
      }
    }
  )
);

// Serialize user to the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error);
  }
});