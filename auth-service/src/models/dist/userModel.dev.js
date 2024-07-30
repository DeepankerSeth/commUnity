"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var userSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function required() {
      return !this.googleId && !this.facebookId && !this.appleId;
    },
    minlength: 7
  },
  googleId: String,
  facebookId: String,
  appleId: String,
  location: {
    type: {
      type: String,
      "enum": ['Point'],
      "default": 'Point'
    },
    coordinates: {
      type: [Number],
      "default": [0, 0]
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  failedLoginAttempts: {
    type: Number,
    "default": 0
  },
  lockoutTime: {
    type: Date
  }
});
userSchema.index({
  location: '2dsphere'
});
userSchema.pre('save', function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!this.isModified('password')) {
            _context.next = 4;
            break;
          }

          _context.next = 3;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(this.password, 8));

        case 3:
          this.password = _context.sent;

        case 4:
          next();

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});

userSchema.methods.generateAuthToken = function _callee2() {
  var token;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = jwt.sign({
            _id: this._id.toString()
          }, process.env.JWT_SECRET);
          this.tokens = this.tokens.concat({
            token: token
          });
          _context2.next = 4;
          return regeneratorRuntime.awrap(this.save());

        case 4:
          return _context2.abrupt("return", token);

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};

userSchema.methods.incrementLoginAttempts = function () {
  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= 5) {
    this.lockoutTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
  }

  return this.save();
};

userSchema.methods.resetLoginAttempts = function () {
  this.failedLoginAttempts = 0;
  this.lockoutTime = null;
  return this.save();
};

var User = _mongoose["default"].model('User', userSchema);

var _default = User;
exports["default"] = _default;