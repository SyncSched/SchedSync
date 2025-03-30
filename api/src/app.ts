import './utils/env-loader';

import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import { generateToken } from './utils/jwt';
import { User } from './models/user.model';
import { attachPublicRoutes, attachPrivateRoutes } from './routes/routes';
import { authMiddleware } from './middleware/authMiddleware';
import { RouteNotFoundError } from './errors';
import { handleError } from './middleware/error';
import { initScheduleCron } from './cron/scheduleCron';
import { initNotificationCron } from './cron/RemainderCron';

import './utils/passportConfig';

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.CLIENT_URL,
    session: true,
  }),
  (req, res) => {
    const user = req.user as User;
    console.log(user);
    if (user && user.id) {
      const token = generateToken({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      });
      console.log('Login successful. User details:', req.user);
      res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
    } else {
      console.log('Login failed. User not authenticated.');
      res.redirect(process.env.CLIENT_URL || 'http://localhost:8080');
    }
  },
);

// Public routes
attachPublicRoutes(app);

// Middleware call
app.use('/', authMiddleware);

// Private routes
attachPrivateRoutes(app);

app.use((req, _res, next) => next(new RouteNotFoundError(req.originalUrl)));
app.use(handleError);

// Initialize cron jobs
initScheduleCron();
initNotificationCron();

export default app;
