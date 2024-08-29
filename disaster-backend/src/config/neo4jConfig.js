import neo4j from 'neo4j-driver';

export const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

export const initializeNeo4j = async () => {
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS num');
    console.log('Successfully connected to Neo4j');
    return result.records[0].get('num').toNumber() === 1;
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
    return false;
  } finally {
    await session.close();
  }
};

process.on('exit', () => {
  driver.close();
});
