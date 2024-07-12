const express = require('express');
const router = express.Router();

router.get('/predict', (req, res) => {
  res.json({ message: 'Disaster prediction endpoint' });
});

module.exports = router;