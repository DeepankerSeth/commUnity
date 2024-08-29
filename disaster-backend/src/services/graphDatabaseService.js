console.log('Loading graphDatabaseService.js');
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'neo4j+s://231cc601.databases.neo4j.io',
  neo4j.auth.basic('neo4j', 'HpEZSBskq3gqsv6lpJNkQhQQAVa3vqMPR3FqM6i9rCk')
);

export async function createNewIncidentReportNeo4j(incidentData) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      CREATE (i:IncidentReport {
        id: randomUUID(),
        userId: $userId,
        type: $type,
        title: $title,
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
        mediaUrls: JSON.stringify(incidentData.mediaUrls || []),
        keywords: incidentData.metadata?.keywords || [],
        incidentName: incidentData.metadata?.incidentName,
        placeOfImpact: incidentData.metadata?.placeOfImpact || 'Unknown Location',
        neighborhood: incidentData.metadata?.neighborhood
      }
    );
    return result.records[0].get('i').properties;
  } finally {
    await session.close();
  }
}

export async function getIncidentReportNeo4j(id) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport {id: $id})
      RETURN i
      `,
      { id }
    );
    return result.records[0]?.get('i').properties;
  } finally {
    await session.close();
  }
}

export async function updateIncidentReport(id, updateData) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport {id: $id})
      SET i += $updateData, i.updatedAt = datetime()
      RETURN i
      `,
      { id, updateData }
    );
    return result.records[0].get('i').properties;
  } finally {
    await session.close();
  }
}

export async function deleteIncidentReport(id) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (i:IncidentReport {id: $id})
      DETACH DELETE i
      `,
      { id }
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
      MATCH (i:IncidentReport {id: $incidentId})-[:HAS_KEYWORD]->(k:Keyword)<-[:HAS_KEYWORD]-(relatedIncident:IncidentReport)
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
      MATCH (i:IncidentReport)-[:OCCURRED_AT]->(l:Location)
      WHERE point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                           point({latitude: $latitude, longitude: $longitude})) <= $radius
      RETURN i, l
      ORDER BY i.createdAt DESC
      LIMIT 50
      `,
      { latitude: location.latitude, longitude: location.longitude, radius }
    );
    return result.records.map(record => ({
      incident: record.get('i').properties,
      location: record.get('l').properties
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
      MATCH (i:IncidentReport {id: $incidentId})-[r:HAS_UPDATE]->(u:Update)
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
        id: $id,
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
        id: incident.id,
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
      MATCH (i:Incident {id: $incidentId})
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
      MATCH (i:Incident {id: $incidentId})
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

export async function getIncidentReportsNeo4j() {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport)
      RETURN i
      ORDER BY i.createdAt DESC
      LIMIT 50
      `
    );
    return result.records.map(record => record.get('i').properties);
  } finally {
    await session.close();
  }
}