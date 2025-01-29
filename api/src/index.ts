import express, { Request, Response } from 'express';
import passport from 'passport';
import session from 'express-session'
import cors from 'cors'
import { generateToken } from './utils/jwt';
import { User } from './models/user.model';
import { attachPublicRoutes } from './routes/routes';
import { attachPrivateRoutes } from './routes/routes';
import { authMiddleware } from './middleware/authMiddleware';
import { RouteNotFoundError } from './errors';
import { handleError } from './middleware/error';
import './utils/passportConfig'

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
    failureRedirect: 'http://localhost:8080/',
    session: true,
  }),
  (req, res) => {
    const user = req.user as User;
    console.log(user);
    if (user && user.id) {
      const token = generateToken({
        sub: user.id.toString(),
        email: user.email,
      })
      console.log('Login successful. User details:', req.user);
      res.redirect(`http://localhost:8080/login?token=${token}`);
    } else {
      console.log('Login failed. User not authenticated.');
      res.redirect('http://localhost:8080/');
    }
  },
);


//public routes
attachPublicRoutes(app);

//Middleware call
app.use('/', authMiddleware);

//private routes
attachPrivateRoutes(app);


app.use((req, _res, next) => next(new RouteNotFoundError(req.originalUrl)));
app.use(handleError);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});