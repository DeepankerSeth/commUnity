import { createClient } from 'redis';
import IncidentReport from '../models/incidentReport.js';
import { getUserFromAuth0 } from '../services/auth0Service.js';

const STATS_CACHE_KEY = 'disaster_statistics';
const STATS_CACHE_EXPIRY = 3600; // 1 hour

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export async function generateStatistics(auth0Id = null) {
  try {
    if (!redisClient.isReady) {
      await redisClient.connect();
    }

    const cachedStats = await redisClient.get(STATS_CACHE_KEY);
    if (cachedStats && !auth0Id) {
      return JSON.parse(cachedStats);
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyStats, monthlyStats, heatmapData] = await Promise.all([
      getAggregatedStats(oneWeekAgo, auth0Id),
      getAggregatedStats(oneMonthAgo, auth0Id),
      getHeatmapData(auth0Id)
    ]);

    const statistics = {
      weeklyStats,
      monthlyStats,
      heatmapData
    };

    if (!auth0Id) {
      await redisClient.setEx(STATS_CACHE_KEY, STATS_CACHE_EXPIRY, JSON.stringify(statistics));
    }

    return statistics;
  } catch (error) {
    console.error('Error generating statistics:', error);
    // Return a default or empty statistics object if Redis fails
    return { weeklyStats: {}, monthlyStats: {}, heatmapData: [] };
  }
}

async function getAggregatedStats(startDate, auth0Id = null) {
  let match = { createdAt: { $gte: startDate } };
  if (auth0Id) {
    match.auth0Id = auth0Id;
  }

  return IncidentReport.aggregate([
    { $match: match },
    { $group: {
      _id: '$type',
      count: { $sum: 1 },
      averageSeverity: { $avg: '$severity' },
      averageImpactRadius: { $avg: '$impactRadius' }
    }},
    { $sort: { count: -1 } }
  ]);
}

async function getHeatmapData(auth0Id = null) {
  let match = {};
  if (auth0Id) {
    match.auth0Id = auth0Id;
  }

  return IncidentReport.aggregate([
    { $match: match },
    { $group: {
      _id: {
        lat: { $round: ['$latitude', 2] },
        lng: { $round: ['$longitude', 2] }
      },
      count: { $sum: 1 },
      averageSeverity: { $avg: '$severity' }
    }},
    { $project: {
      _id: 0,
      lat: '$_id.lat',
      lng: '$_id.lng',
      weight: { $multiply: ['$count', '$averageSeverity'] }
    }}
  ]);
}