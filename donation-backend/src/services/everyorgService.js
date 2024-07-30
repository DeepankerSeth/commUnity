const axios = require('axios');

const EVERY_ORG_BASE_URL = 'https://partners.every.org/v0.2';

exports.searchNonprofits = async (searchTerm, apiKey, take = 50, causes = '') => {
  const response = await axios.get(`${EVERY_ORG_BASE_URL}/search/${searchTerm}`, {
    params: { apiKey, take, causes }
  });
  return response.data;
};

exports.getNonprofitDetails = async (identifier, apiKey) => {
  const response = await axios.get(`${EVERY_ORG_BASE_URL}/nonprofit/${identifier}`, {
    params: { apiKey }
  });
  return response.data;
};

exports.createFundraiser = async (fundraiserData, apiKey) => {
  const response = await axios.post(`${EVERY_ORG_BASE_URL}/fundraiser`, fundraiserData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.data;
};