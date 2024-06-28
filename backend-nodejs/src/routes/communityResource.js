const express = require('express');
const router = express.Router();

router.get('/resources', (req, res) => {
  res.json({ message: 'Community resources endpoint' });
});

module.exports = router;