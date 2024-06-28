"use strict";

var express = require('express');

var router = express.Router();
router.get('/predict', function (req, res) {
  res.json({
    message: 'Disaster prediction endpoint'
  });
});
module.exports = router;