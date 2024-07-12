import express from 'express';
const router = express.Router();

router.get('/predict', (req, res) => {
  res.json({ message: 'Disaster prediction endpoint' });
});

export default router;