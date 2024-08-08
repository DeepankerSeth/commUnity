import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

export async function createIncidentNode(incident) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      CREATE (i:Incident {
        id: $id,
        type: $type,
        description: $description,
        latitude: $latitude,
        longitude: $longitude,
        severity: $severity,
        impactRadius: $impactRadius,
        incidentName: $incidentName,
        placeOfImpact: $placeOfImpact,
        createdAt: datetime($createdAt)
      })
      RETURN i
      `,
      {
        id: incident._id.toString(),
        type: incident.type,
        description: incident.description,
        latitude: incident.latitude,
        longitude: incident.longitude,
        severity: incident.severity,
        impactRadius: incident.impactRadius,
        incidentName: incident.metadata.incidentName,
        placeOfImpact: incident.metadata.placeOfImpact,
        createdAt: incident.createdAt.toISOString()
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
      CREATE (i)-[:HAS_KEYWORD]->(k)
      `,
      { incidentId, keywords }
    );
  } finally {
    await session.close();
  }
}

export async function createLocationRelationship(incidentId, placeOfImpact) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (i:Incident {id: $incidentId})
      MERGE (l:Location {name: $placeOfImpact})
      CREATE (i)-[:OCCURRED_AT]->(l)
      `,
      { incidentId, placeOfImpact }
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
      MATCH (i:Incident {id: $incidentId})-[:HAS_KEYWORD]->(k:Keyword)<-[:HAS_KEYWORD]-(relatedIncident:Incident)
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
      MATCH (i:Incident)-[:OCCURRED_AT]->(l:Location)
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
      MATCH (i:Incident {id: $incidentId})-[r:HAS_UPDATE]->(u:Update)
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