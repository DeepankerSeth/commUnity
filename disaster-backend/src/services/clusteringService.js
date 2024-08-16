import { DBSCAN } from 'density-clustering';
import IncidentReport from '../models/incidentReport.js';
import { emitClusterUpdate } from './socketService.js';

const EPSILON = 1000; // 1km in meters
const MIN_POINTS = 2; // Minimum points to form a cluster
const CACHE_EXPIRY = 300000; // 5 minutes in milliseconds

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

  // Cache cluster data in MongoDB
  await IncidentReport.findOneAndUpdate(
    { type: 'clusterCache' },
    { 
      type: 'clusterCache',
      clusterData: clusterData,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  // Emit cluster update to all connected clients
  emitClusterUpdate(clusterData);

  return clusterData;
}

function calculateClusterCenter(points) {
  const sum = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export async function getClusterData() {
  const cachedCluster = await IncidentReport.findOne({ type: 'clusterCache' });
  if (cachedCluster && (new Date() - cachedCluster.updatedAt) < CACHE_EXPIRY) {
    return cachedCluster.clusterData;
  }
  return performClustering();
}