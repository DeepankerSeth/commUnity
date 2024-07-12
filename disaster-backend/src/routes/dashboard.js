//Setting up a basic Express route to serve the dashboard

// src/routes/dashboard.js
const express = require('express');
const router = express.Router();

// Route to render the dashboard
router.get('/', (req, res) => {
  res.render('dashboard', { title: 'Disaster Response Dashboard' });
});

// Export the router
module.exports = router;
