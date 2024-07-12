//Setting up a basic Express route to serve the dashboard

// src/routes/dashboard.js
import express from 'express';
const router = express.Router();

// Route to render the dashboard
router.get('/', (req, res) => {
  res.render('dashboard', { title: 'Disaster Response Dashboard' });
});

// Export the router
export default router;