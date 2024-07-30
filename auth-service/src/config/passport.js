import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import User from '../models/userModel.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
      } else {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        });
      }
      await user.save();
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.facebookId = profile.id;
      } else {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          facebookId: profile.id
        });
      }
      await user.save();
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: "/auth/apple/callback",
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ appleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.appleId = profile.id;
      } else {
        user = new User({
          name: profile.name.firstName + ' ' + profile.name.lastName,
          email: profile.email,
          appleId: profile.id
        });
      }
      await user.save();
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;