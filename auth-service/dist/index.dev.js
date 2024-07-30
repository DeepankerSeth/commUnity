"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "User", {
  enumerable: true,
  get: function get() {
    return _userModel["default"];
  }
});
Object.defineProperty(exports, "auth", {
  enumerable: true,
  get: function get() {
    return _auth.auth;
  }
});
Object.defineProperty(exports, "passport", {
  enumerable: true,
  get: function get() {
    return _passport["default"];
  }
});
Object.defineProperty(exports, "authRoutes", {
  enumerable: true,
  get: function get() {
    return _authRoutes["default"];
  }
});

var _userModel = _interopRequireDefault(require("./src/models/userModel.js"));

var _auth = require("./src/middleware/auth.js");

var _passport = _interopRequireDefault(require("./src/config/passport.js"));

var _authRoutes = _interopRequireDefault(require("./src/routes/authRoutes.js"));

var _express = _interopRequireDefault(require("express"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _csurf = _interopRequireDefault(require("csurf"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
app.use((0, _cookieParser["default"])());
var csrfProtection = (0, _csurf["default"])({
  cookie: true
}); // Apply CSRF protection to all routes

app.use(csrfProtection); // Add rate limiting

var limiter = (0, _expressRateLimit["default"])({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs

}); // Apply rate limiting to all routes

app.use(limiter); // Add a route to get CSRF token

app.get('/csrf-token', function (req, res) {
  res.json({
    csrfToken: req.csrfToken()
  });
}); // Use authentication routes

app.use('/auth', _authRoutes["default"]); // ... rest of your app configuration ...

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Auth service running on port ".concat(port));
});