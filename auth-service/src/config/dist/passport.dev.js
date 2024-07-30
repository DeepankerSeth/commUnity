"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _passport = _interopRequireDefault(require("passport"));

var _passportGoogleOauth = require("passport-google-oauth20");

var _passportFacebook = require("passport-facebook");

var _passportApple = require("passport-apple");

var _userModel = _interopRequireDefault(require("../models/userModel.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_passport["default"].use(new _passportGoogleOauth.Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, function _callee(accessToken, refreshToken, profile, done) {
  var user;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            googleId: profile.id
          }));

        case 3:
          user = _context.sent;

          if (user) {
            _context.next = 11;
            break;
          }

          _context.next = 7;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            email: profile.emails[0].value
          }));

        case 7:
          user = _context.sent;

          if (user) {
            user.googleId = profile.id;
          } else {
            user = new _userModel["default"]({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id
            });
          }

          _context.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          done(null, user);
          _context.next = 17;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          done(_context.t0, null);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}));

_passport["default"].use(new _passportFacebook.Strategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email']
}, function _callee2(accessToken, refreshToken, profile, done) {
  var user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            facebookId: profile.id
          }));

        case 3:
          user = _context2.sent;

          if (user) {
            _context2.next = 11;
            break;
          }

          _context2.next = 7;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            email: profile.emails[0].value
          }));

        case 7:
          user = _context2.sent;

          if (user) {
            user.facebookId = profile.id;
          } else {
            user = new _userModel["default"]({
              name: profile.displayName,
              email: profile.emails[0].value,
              facebookId: profile.id
            });
          }

          _context2.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          done(null, user);
          _context2.next = 17;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](0);
          done(_context2.t0, null);

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 14]]);
}));

_passport["default"].use(new _passportApple.Strategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: "/auth/apple/callback",
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION
}, function _callee3(accessToken, refreshToken, profile, done) {
  var user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            appleId: profile.id
          }));

        case 3:
          user = _context3.sent;

          if (user) {
            _context3.next = 11;
            break;
          }

          _context3.next = 7;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            email: profile.email
          }));

        case 7:
          user = _context3.sent;

          if (user) {
            user.appleId = profile.id;
          } else {
            user = new _userModel["default"]({
              name: profile.name.firstName + ' ' + profile.name.lastName,
              email: profile.email,
              appleId: profile.id
            });
          }

          _context3.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          done(null, user);
          _context3.next = 17;
          break;

        case 14:
          _context3.prev = 14;
          _context3.t0 = _context3["catch"](0);
          done(_context3.t0, null);

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 14]]);
}));

_passport["default"].serializeUser(function (user, done) {
  done(null, user.id);
});

_passport["default"].deserializeUser(function _callee4(id, done) {
  var user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(_userModel["default"].findById(id));

        case 3:
          user = _context4.sent;
          done(null, user);
          _context4.next = 10;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          done(_context4.t0, null);

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 7]]);
});

var _default = _passport["default"];
exports["default"] = _default;