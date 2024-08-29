console.log('Loading clusteringService.js');
import { DBSCAN } from 'density-clustering';
import { driver } from '../config/neo4jConfig.js';
import { emitClusterUpdate } from './socketService.js';

const EPSILON = 1000; // 1km in meters
const MIN_POINTS = 2; // Minimum points to form a cluster
const CACHE_EXPIRY = 300000; // 5 minutes in milliseconds

export async function performClustering() {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (i:IncidentReport)
      WHERE i.createdAt > datetime() - duration('P1D')
      RETURN i.id, i.latitude, i.longitude
    `);

    const incidents = result.records.map(record => ({
      id: record.get('i.id'),
      latitude: record.get('i.latitude').toNumber(),
      longitude: record.get('i.longitude').toNumber()
    }));

    const points = incidents.map(incident => [incident.latitude, incident.longitude]);
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(points, EPSILON, MIN_POINTS);

    const clusterData = clusters.map(cluster => ({
      center: calculateClusterCenter(cluster.map(index => points[index])),
      incidents: cluster.map(index => incidents[index].id),
      size: cluster.length
    }));

    // Store cluster data in Neo4j
    await session.run(`
      MERGE (c:ClusterCache {type: 'clusterCache'})
      SET c.clusterData = $clusterData,
          c.updatedAt = datetime()
    `, { clusterData: JSON.stringify(clusterData) });

    // Emit cluster update to all connected clients
    emitClusterUpdate(clusterData);

    return clusterData;
  } finally {
    await session.close();
  }
}

function calculateClusterCenter(points) {
  const sum = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export async function getClusterData() {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (c:ClusterCache {type: 'clusterCache'})
      WHERE c.updatedAt > datetime() - duration('PT5M')
      RETURN c.clusterData
    `);

    if (result.records.length > 0) {
      return JSON.parse(result.records[0].get('c.clusterData'));
    }
    return performClustering();
  } finally {
    await session.close();
  }
}