import neo4j from 'neo4j-driver';
import logger from '../utils/logger.js';

export const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

export const initializeNeo4j = async () => {
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS num');
    logger.info('Successfully connected to Neo4j');
    return true;
  } catch (error) {
    logger.error('Error connecting to Neo4j:', error);
    return false;
  } finally {
    await session.close();
  }
};

export const getDriver = () => {
  return driver;
};

export const closeNeo4jConnection = async () => {
  await driver.close();
};

process.on('exit', () => {
  driver.close();
});
