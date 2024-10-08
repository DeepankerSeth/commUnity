console.log('Loading statisticsService.js');
import { createClient } from 'redis';
import { getDriver } from '../config/neo4jConfig.js';
import logger from '../utils/logger.js';

const STATS_CACHE_KEY = 'disaster_statistics';
const STATS_CACHE_EXPIRY = 3600; // 1 hour

let redisClient;

async function initializeRedisClient() {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => logger.error('Redis Client Error', err));

  try {
    await redisClient.connect();
    logger.info('Redis client connected');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
  }
}

export async function getRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    await initializeRedisClient();
  }
  return redisClient;
}

// Call this function when your application starts
initializeRedisClient();

export async function generateStatistics(auth0Id = null) {
  try {
    const redisClient = await getRedisClient();
    
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
    logger.error('Error generating statistics:', error);
    return {};
  }
}

async function getAggregatedStats(startDate, auth0Id = null) {
  const driver = getDriver();
  if (!driver) {
    logger.warn('Neo4j not connected, skipping statistics generation');
    return {};
  }
  const session = driver.session();
  try {
    let query = `
      MATCH (i:IncidentReport)
      WHERE i.createdAt >= $startDate
      ${auth0Id ? 'AND i.auth0Id = $auth0Id' : ''}
      RETURN 
        i.type AS type,
        count(i) AS count,
        avg(i.severity) AS averageSeverity,
        avg(i.impactRadius) AS averageImpactRadius
      ORDER BY count DESC
    `;

    const result = await session.run(query, { startDate: startDate.toISOString(), auth0Id });
    return result.records.map(record => ({
      type: record.get('type'),
      count: record.get('count').toNumber(),
      averageSeverity: record.get('averageSeverity'),
      averageImpactRadius: record.get('averageImpactRadius')
    }));
  } finally {
    await session.close();
  }
}

async function getHeatmapData(auth0Id = null) {
  const driver = getDriver();
  if (!driver) {
    logger.warn('Neo4j not connected, skipping statistics generation');
    return {};
  }
  const session = driver.session();
  try {
    let query = `
      MATCH (i:IncidentReport)
      ${auth0Id ? 'WHERE i.auth0Id = $auth0Id' : ''}
      RETURN 
        round(i.latitude, 2) AS lat,
        round(i.longitude, 2) AS lng,
        count(i) AS count,
        avg(i.severity) AS averageSeverity
    `;

    const result = await session.run(query, { auth0Id });
    return result.records.map(record => ({
      lat: record.get('lat'),
      lng: record.get('lng'),
      weight: record.get('count').toNumber() * record.get('averageSeverity')
    }));
  } finally {
    await session.close();
  }
}