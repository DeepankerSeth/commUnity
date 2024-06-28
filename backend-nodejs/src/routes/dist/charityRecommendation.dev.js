"use strict";

var express = require('express');

var router = express.Router();
router.get('/recommend', function (req, res) {
  res.json({
    message: 'Charity recommendation endpoint'
  });
});
module.exports = router;