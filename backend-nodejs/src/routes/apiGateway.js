const express = require('express');
const httpProxy = require('express-http-proxy');
const router = express.Router();

const disasterServiceProxy = httpProxy('https://disaster-service');

router.use('/disaster', (req, res, next) => {
  // Authentication and other middleware can be added here
  disasterServiceProxy(req, res, next);
});

module.exports = router;