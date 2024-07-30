"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _userModel = _interopRequireDefault(require("../models/userModel.js"));

var _auth = require("../middleware/auth.js");

var _passport = _interopRequireDefault(require("passport"));

var _csurf = _interopRequireDefault(require("csurf"));

var _zxcvbn = _interopRequireDefault(require("zxcvbn"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

var csrfProtection = (0, _csurf["default"])({
  cookie: true
}); // Rate limiting middleware

var authLimiter = (0, _expressRateLimit["default"])({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs

});
router.post('/register', csrfProtection, authLimiter, function _callee(req, res) {
  var _req$body, name, email, password, passwordStrength, user, token;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password; // Check password strength

          passwordStrength = (0, _zxcvbn["default"])(password);

          if (!(passwordStrength.score < 3)) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", res.status(400).send({
            error: 'Password is too weak. Please choose a stronger password.'
          }));

        case 5:
          user = new _userModel["default"]({
            name: name,
            email: email,
            password: password
          });
          _context.next = 8;
          return regeneratorRuntime.awrap(user.save());

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(user.generateAuthToken());

        case 10:
          token = _context.sent;
          res.status(201).send({
            user: user,
            token: token
          });
          _context.next = 17;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          res.status(400).send(_context.t0);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
});
router.post('/login', csrfProtection, authLimiter, function _callee2(req, res) {
  var user, isMatch, token;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            email: req.body.email
          }));

        case 3:
          user = _context2.sent;

          if (user) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(400).send('Invalid email or password'));

        case 6:
          if (!(user.lockoutTime && user.lockoutTime > new Date())) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", res.status(403).send('Account is locked. Try again later.'));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(user.comparePassword(req.body.password));

        case 10:
          isMatch = _context2.sent;

          if (isMatch) {
            _context2.next = 17;
            break;
          }

          user.loginAttempts++;

          if (user.loginAttempts >= 5) {
            user.lockoutTime = new Date(Date.now() + 30 * 60 * 1000); // Lock account for 30 minutes
          }

          _context2.next = 16;
          return regeneratorRuntime.awrap(user.save());

        case 16:
          return _context2.abrupt("return", res.status(400).send('Invalid email or password'));

        case 17:
          user.loginAttempts = 0;
          _context2.next = 20;
          return regeneratorRuntime.awrap(user.save());

        case 20:
          _context2.next = 22;
          return regeneratorRuntime.awrap(user.generateAuthToken());

        case 22:
          token = _context2.sent;
          res.send({
            user: user,
            token: token
          });
          _context2.next = 29;
          break;

        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](0);
          res.status(400).send();

        case 29:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 26]]);
});
router.post('/logout', csrfProtection, _auth.auth, function _callee3(req, res) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          req.user.tokens = req.user.tokens.filter(function (token) {
            return token.token !== req.token;
          });
          _context3.next = 4;
          return regeneratorRuntime.awrap(req.user.save());

        case 4:
          res.send();
          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          res.status(500).send();

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // Google OAuth

router.get('/auth/google', _passport["default"].authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/auth/google/callback', _passport["default"].authenticate('google', {
  failureRedirect: '/login'
}), function (req, res) {
  var token = req.user.generateAuthToken();
  res.redirect("".concat(process.env.FRONTEND_URL, "/auth-success?token=").concat(token));
}); // Facebook OAuth

router.get('/auth/facebook', _passport["default"].authenticate('facebook', {
  scope: ['email']
}));
router.get('/auth/facebook/callback', _passport["default"].authenticate('facebook', {
  failureRedirect: '/login'
}), function (req, res) {
  var token = req.user.generateAuthToken();
  res.redirect("".concat(process.env.FRONTEND_URL, "/auth-success?token=").concat(token));
}); // Apple OAuth

router.get('/auth/apple', _passport["default"].authenticate('apple'));
router.get('/auth/apple/callback', _passport["default"].authenticate('apple', {
  failureRedirect: '/login'
}), function (req, res) {
  var token = req.user.generateAuthToken();
  res.redirect("".concat(process.env.FRONTEND_URL, "/auth-success?token=").concat(token));
});
var _default = router;
exports["default"] = _default;