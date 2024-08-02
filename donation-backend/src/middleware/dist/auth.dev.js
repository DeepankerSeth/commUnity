"use strict";

var jwt = require('jsonwebtoken');

var authenticateJWT = function authenticateJWT(req, res, next) {
  var authHeader = req.headers.authorization;

  if (authHeader) {
    var token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.NEXTAUTH_SECRET, function (err, user) {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  authenticateJWT: authenticateJWT
};