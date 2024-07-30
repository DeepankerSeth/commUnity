import express from 'express';
import User from '../models/userModel.js';
import { auth } from '../middleware/auth.js';
import passport from 'passport';
import csrf from 'csurf';
import zxcvbn from 'zxcvbn';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

router.post('/register', csrfProtection, authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check password strength
    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 3) {
      return res.status(400).send({ error: 'Password is too weak. Please choose a stronger password.' });
    }

    const user = new User({ name, email, password });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', csrfProtection, authLimiter, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    if (user.lockoutTime && user.lockoutTime > new Date()) {
      return res.status(403).send('Account is locked. Try again later.');
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      user.loginAttempts++;
      if (user.loginAttempts >= 5) {
        user.lockoutTime = new Date(Date.now() + 30 * 60 * 1000); // Lock account for 30 minutes
      }
      await user.save();
      return res.status(400).send('Invalid email or password');
    }

    user.loginAttempts = 0;
    await user.save();
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post('/logout', csrfProtection, auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

// Facebook OAuth
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

// Apple OAuth
router.get('/auth/apple', passport.authenticate('apple'));

router.get('/auth/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

export default router;