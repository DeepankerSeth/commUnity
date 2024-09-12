"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = require("uuid");

var requestId = function requestId(req, res, next) {
  req.id = (0, _uuid.v4)();
  next();
};

var _default = requestId;
exports["default"] = _default;