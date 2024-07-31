import IncidentReport from '../models/incidentReport';
import { redisClient } from '../db/redis';

const STATS_CACHE_KEY = 'disaster_statistics';
const STATS_CACHE_EXPIRY = 3600; // 1 hour

export async function generateStatistics() {
  const cachedStats = await redisClient.get(STATS_CACHE_KEY);
  if (cachedStats) {
    return JSON.parse(cachedStats);
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [weeklyStats, monthlyStats, heatmapData] = await Promise.all([
    getAggregatedStats(oneWeekAgo),
    getAggregatedStats(oneMonthAgo),
    getHeatmapData()
  ]);

  const statistics = {
    weeklyStats,
    monthlyStats,
    heatmapData
  };

  await redisClient.setex(STATS_CACHE_KEY, STATS_CACHE_EXPIRY, JSON.stringify(statistics));

  return statistics;
}

async function getAggregatedStats(startDate) {
  return IncidentReport.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: {
      _id: '$type',
      count: { $sum: 1 },
      averageSeverity: { $avg: '$severity' },
      averageImpactRadius: { $avg: '$impactRadius' }
    }},
    { $sort: { count: -1 } }
  ]);
}

async function getHeatmapData() {
  return IncidentReport.aggregate([
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