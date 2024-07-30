"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auth = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _userModel = _interopRequireDefault(require("../models/userModel.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var auth = function auth(req, res, next) {
  var token, decoded, user;
  return regeneratorRuntime.async(function auth$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          token = req.header('Authorization').replace('Bearer ', '');
          decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);

          if (!(Date.now() >= decoded.exp * 1000)) {
            _context.next = 5;
            break;
          }

          throw new Error('Token has expired');

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(_userModel["default"].findOne({
            _id: decoded._id,
            'tokens.token': token
          }));

        case 7:
          user = _context.sent;

          if (user) {
            _context.next = 10;
            break;
          }

          throw new Error();

        case 10:
          req.token = token;
          req.user = user;
          next();
          _context.next = 18;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          res.status(401).send({
            error: 'Please authenticate.'
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

exports.auth = auth;