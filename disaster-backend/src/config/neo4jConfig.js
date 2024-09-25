import neo4j from 'neo4j-driver';
import logger from '../utils/logger.js';

let driver;

export const initializeNeo4j = async () => {
  try {
    driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );
    await driver.verifyConnectivity();
    logger.info('Successfully connected to Neo4j');
    return true;
  } catch (error) {
    logger.error('Error connecting to Neo4j:', error);
    return false;
  }
};

export const getDriver = () => {
  if (!driver) {
    logger.warn('Neo4j driver not initialized. Attempting to initialize...');
    initializeNeo4j();
  }
  return driver;
};

export const runQuery = async (cypher, params = {}) => {
  if (!driver) {
    await initializeNeo4j();
  }
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } catch (error) {
    logger.error('Error running Neo4j query:', error);
    throw error;
  } finally {
    await session.close();
  }
};

export const closeNeo4jConnection = async () => {
  if (driver) {
    await driver.close();
    driver = null;
    logger.info('Neo4j connection closed');
  }
};

process.on('exit', closeNeo4jConnection);
