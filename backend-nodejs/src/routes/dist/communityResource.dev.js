"use strict";

var express = require('express');

var router = express.Router();
router.get('/resources', function (req, res) {
  res.json({
    message: 'Community resources endpoint'
  });
});
module.exports = router;