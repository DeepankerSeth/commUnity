import express from 'express';
import { performHybridSearch, getFacets } from '../services/searchService.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10, ...filters } = req.query;
    const results = await performHybridSearch(query, parseInt(limit), filters);
    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'An error occurred while performing the search' });
  }
});

router.get('/facets', async (req, res) => {
  try {
    const facets = await getFacets();
    res.json(facets);
  } catch (error) {
    console.error('Error fetching facets:', error);
    res.status(500).json({ error: 'An error occurred while fetching facets' });
  }
});

export default router;
