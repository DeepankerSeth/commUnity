const express = require('express');
const router = express.Router();

router.get('/recommend', (req, res) => {
  res.json({ message: 'Charity recommendation endpoint' });
});

module.exports = router;
