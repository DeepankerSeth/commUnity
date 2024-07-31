import { DBSCAN } from 'density-clustering';
import IncidentReport from '../models/incidentReport';
import { emitClusterUpdate } from './socketService';
import { redisClient } from '../db/redis';

const EPSILON = 1000; // 1km in meters
const MIN_POINTS = 2; // Minimum points to form a cluster
const CACHE_KEY = 'incident_clusters';
const CACHE_EXPIRY = 300; // 5 minutes

export async function performClustering() {
  const incidents = await IncidentReport.find({
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  const points = incidents.map(incident => [incident.latitude, incident.longitude]);
  const dbscan = new DBSCAN();
  const clusters = dbscan.run(points, EPSILON, MIN_POINTS);

  const clusterData = clusters.map(cluster => ({
    center: calculateClusterCenter(cluster.map(index => points[index])),
    incidents: cluster.map(index => incidents[index]._id),
    size: cluster.length
  }));

  // Cache cluster data
  await redisClient.setex(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(clusterData));

  // Emit cluster update to all connected clients
  emitClusterUpdate(clusterData);

  return clusterData;
}

function calculateClusterCenter(points) {
  const sum = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export async function getClusterData() {
  const cachedData = await redisClient.get(CACHE_KEY);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  return performClustering();
}