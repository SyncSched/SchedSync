import passport from 'passport';
import { Strategy as GoogleStrategy, StrategyOptions } from 'passport-google-oauth20';
import { createUser } from '../services/user.service'; // Import the createUser function
import { prisma } from './prisma-client';

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
      callbackURL: `${process.env.NODE_API_URL}/auth/google/callback`,
      // callbackURL: 'https://jtxg13v8e1.execute-api.us-east-1.amazonaws.com/default/auth/google/callback',
      // callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
      accessType: 'offline' as const,  // Request a refresh token
      prompt: 'consent' as const,      // Force the consent screen to appear every time
    } as StrategyOptions,
    async (accessToken: string, refreshToken: string | undefined, profile: GoogleProfile, done: any) => {
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

        // Store the tokens for Google Calendar access
        console.log("first",accessToken,refreshToken,user.id);
        if (accessToken && user.id) {
          console.log("second")
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1); // Google tokens typically expire in 1 hour

          try {
            // Check if we already have a token for this user
            const existingToken = await prisma.calendarToken.findUnique({
              where: { userId: user.id }
            });

            if (existingToken) {
              // Update the token, but only update refreshToken if it's provided
              await prisma.calendarToken.update({
                where: { userId: user.id },
                data: {
                  accessToken,
                  ...(refreshToken ? { refreshToken } : {}),
                  expiresAt: expiryDate,
                  scope: 'https://www.googleapis.com/auth/calendar.readonly',
                },
              });
            } else {
              // Create a new token entry
              // If no refreshToken is provided, we'll store an empty string and handle it in the calendar service
              await prisma.calendarToken.create({
                data: {
                  userId: user.id,
                  accessToken,
                  refreshToken: refreshToken || '',
                  expiresAt: expiryDate,
                  scope: 'https://www.googleapis.com/auth/calendar.readonly',
                },
              });
            }
          } catch (error) {
            console.error('Error storing calendar tokens:', error);
          }
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