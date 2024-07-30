import User from './src/models/userModel.js';
import { auth } from './src/middleware/auth.js';
import passport from './src/config/passport.js';
import authRoutes from './src/routes/authRoutes.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to all routes
app.use(csrfProtection);

// Add rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Add a route to get CSRF token
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Use authentication routes
app.use('/auth', authRoutes);

// ... rest of your app configuration ...

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
});

export { User, auth, passport, authRoutes };