import NodeCache from 'node-cache';

const locationCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

export function getCachedLocation(query) {
  return locationCache.get(query);
}

export function setCachedLocation(query, result) {
  locationCache.set(query, result);
}
