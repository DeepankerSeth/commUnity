console.log('Loading graphDatabaseService.js');
import neo4j from 'neo4j-driver';
import { getDriver, runQuery } from '../config/neo4jConfig.js';
import logger from '../utils/logger.js';

export async function createNewIncidentReportNeo4j(incidentData) {
  try {
    console.log('Creating new incident report:', incidentData);
    const result = await runQuery(
      `
      CREATE (i:IncidentReport {
        incidentId: randomUUID(),
        type: $type,
        description: $description,
        latitude: $latitude,
        longitude: $longitude,
        mediaUrls: $mediaUrls,
        severity: $severity,
        impactRadius: $impactRadius,
        analysis: $analysis,
        incidentName: $incidentName,
        placeOfImpact: $placeOfImpact,
        neighborhood: $neighborhood,
        keywords: $keywords,
        reporterIP: $reporterIP,
        ipLatitude: $ipLatitude,
        ipLongitude: $ipLongitude,
        needsReview: $needsReview,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      WITH i
      UNWIND $keywords AS keyword
      MERGE (k:Keyword {name: keyword})
      CREATE (i)-[:HAS_KEYWORD]->(k)
      WITH i, $placeOfImpact AS poi
      MERGE (l:Location {name: poi})
      CREATE (i)-[:OCCURRED_AT]->(l)
      RETURN i
      `,
      {
        ...incidentData,
        latitude: incidentData.location ? incidentData.location.coordinates[1] : null,
        longitude: incidentData.location ? incidentData.location.coordinates[0] : null,
        mediaUrls: JSON.stringify(incidentData.mediaUrls || []),
        keywords: JSON.stringify(incidentData.metadata?.keywords || []),
        severity: incidentData.severity || 0,
        impactRadius: incidentData.impactRadius || 0,
        analysis: incidentData.analysis || '',
        incidentName: incidentData.metadata && incidentData.metadata.incidentName ? incidentData.metadata.incidentName : 'Unnamed Incident',
        placeOfImpact: incidentData.metadata && incidentData.metadata.placeOfImpact ? incidentData.metadata.placeOfImpact : 'Unknown Location',
        neighborhood: incidentData.metadata && incidentData.metadata.neighborhood ? incidentData.metadata.neighborhood : 'Unknown Neighborhood',
        reporterIP: incidentData.reporterIP || null,
        ipLatitude: incidentData.ipLocation ? incidentData.ipLocation.latitude : null,
        ipLongitude: incidentData.ipLocation ? incidentData.ipLocation.longitude : null,
        needsReview: incidentData.needsReview || false
      }
    );
    console.log('Incident report created successfully');
    return result[0].get('i').properties;
  } catch (error) {
    logger.error('Error creating incident report in Neo4j:', error);
    throw error;
  }
}

export async function getIncidentReportNeo4j(incidentId) {
  try {
    const result = await runQuery(
      `
      MATCH (i:IncidentReport {incidentId: $incidentId})
      RETURN i
      `,
      { incidentId }
    );
    return result[0]?.get('i').properties;
  } catch (error) {
    logger.error('Error fetching incident report from Neo4j:', error);
    throw error;
  }
}

export async function updateIncidentReport(incidentId, updateData) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport {incidentId: $incidentId})
      SET i += $updateData, i.updatedAt = datetime()
      RETURN i
      `,
      { incidentId, updateData }
    );
    return result.records[0].get('i').properties;
  } catch (error) {
    logger.error('Error updating incident report in Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function deleteIncidentReport(incidentId) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (i:IncidentReport {incidentId: $incidentId})
      DETACH DELETE i
      `,
      { incidentId }
    );
  } finally {
    await session.close();
  }
}

export async function getRelatedIncidents(incidentId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport {incidentId: $incidentId})-[:HAS_KEYWORD]->(k:Keyword)<-[:HAS_KEYWORD]-(relatedIncident:IncidentReport)
      WHERE i <> relatedIncident
      RETURN DISTINCT relatedIncident, count(k) AS commonKeywords
      ORDER BY commonKeywords DESC
      LIMIT 5
      `,
      { incidentId }
    );
    return result.records.map(record => ({
      incident: record.get('relatedIncident').properties,
      commonKeywords: record.get('commonKeywords').toNumber()
    }));
  } finally {
    await session.close();
  }
}

export async function getIncidentsByLocation(location, radius) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport)
      WHERE point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                           point({latitude: $latitude, longitude: $longitude})) <= $radius
      RETURN i,
             point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                            point({latitude: $latitude, longitude: $longitude})) AS distance
      ORDER BY distance
      LIMIT 50
      `,
      { latitude: location.latitude, longitude: location.longitude, radius }
    );
    return result.records.map(record => ({
      incident: record.get('i').properties,
      distance: record.get('distance').toNumber()
    }));
  } finally {
    await session.close();
  }
}

export async function getIncidentTimeline(incidentId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport {incidentId: $incidentId})-[r:HAS_UPDATE]->(u:Update)
      RETURN u
      ORDER BY u.timestamp
      `,
      { incidentId }
    );
    return result.records.map(record => record.get('u').properties);
  } finally {
    await session.close();
  }
}

export async function createIncidentNode(incident) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      CREATE (i:Incident {
        incidentId: $incidentId,
        type: $type,
        description: $description,
        severity: $severity,
        impactRadius: $impactRadius,
        latitude: $latitude,
        longitude: $longitude,
        createdAt: datetime()
      })
      RETURN i
      `,
      {
        incidentId: incident.incidentId,
        type: incident.type,
        description: incident.description,
        severity: incident.severity,
        impactRadius: incident.impactRadius,
        latitude: incident.latitude,
        longitude: incident.longitude
      }
    );
    return result.records[0].get('i').properties;
  } finally {
    await session.close();
  }
}

export async function createKeywordRelationships(incidentId, keywords) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (i:Incident {incidentId: $incidentId})
      UNWIND $keywords AS keyword
      MERGE (k:Keyword {name: keyword})
      MERGE (i)-[:HAS_KEYWORD]->(k)
      `,
      {
        incidentId,
        keywords
      }
    );
    console.log(`Created keyword relationships for incident ${incidentId}`);
  } catch (error) {
    console.error(`Error creating keyword relationships for incident ${incidentId}:`, error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function createLocationRelationship(incidentId, locationName) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (i:Incident {incidentId: $incidentId})
      MERGE (l:Location {name: $locationName})
      MERGE (i)-[:OCCURRED_AT]->(l)
      `,
      {
        incidentId,
        locationName
      }
    );
    console.log(`Created location relationship for incident ${incidentId} at ${locationName}`);
  } catch (error) {
    console.error(`Error creating location relationship for incident ${incidentId}:`, error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function getIncidentReportsNeo4j(query = {}) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:Incident)
      WHERE i.createdAt >= $startDate
      RETURN i
      ORDER BY i.createdAt DESC
      LIMIT 50
      `,
      { startDate: query.createdAt?.$gte?.toISOString() || new Date(0).toISOString() }
    );
    return result.records.map(record => record.get('i').properties);
  } catch (error) {
    console.error('Error fetching incident reports from Neo4j:', error);
    return []; // Return an empty array if there's an error
  } finally {
    await session.close();
  }
}

export async function getIncidentReportsNearLocation(latitude, longitude, radius) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:Incident)
      WHERE point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                           point({latitude: $latitude, longitude: $longitude})) <= $radius
      RETURN i,
             point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                            point({latitude: $latitude, longitude: $longitude})) AS distance
      ORDER BY distance
      LIMIT 50
      `,
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude), radius: parseFloat(radius) }
    );
    return result.records.map(record => ({
      ...record.get('i').properties,
      distance: record.get('distance').toNumber()
    }));
  } finally {
    await session.close();
  }
}