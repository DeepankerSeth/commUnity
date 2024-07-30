const axios = require('axios');
const { validationResult } = require('express-validator');

const EVERY_ORG_BASE_URL = 'https://partners.every.org/v0.2';
const PRIVATE_KEY = process.env.EVERY_ORG_PRIVATE_KEY;

const everyorgClient = axios.create({
  baseURL: EVERY_ORG_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PRIVATE_KEY}`
  },
});

const everyorgService = require('../services/everyorgService');
const logger = require('../utils/logger');

exports.searchNonprofits = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { searchTerm } = req.params;
    const { take, causes } = req.query;
    const apiKey = process.env.EVERY_ORG_PUBLIC_API_KEY;
    const data = await everyorgService.searchNonprofits(searchTerm, apiKey, take, causes);
    logger.info(`Successfully searched nonprofits with term: ${searchTerm}`);
    res.json(data);
  } catch (error) {
    logger.error(`Error in searchNonprofits: ${error.message}`, { error });
    next(error);
  }
};

exports.getNonprofitDetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier } = req.params;
    const apiKey = process.env.EVERY_ORG_PUBLIC_API_KEY;
    const data = await everyorgService.getNonprofitDetails(identifier, apiKey);
    logger.info(`Successfully retrieved nonprofit details for identifier: ${identifier}`);
    res.json(data);
  } catch (error) {
    logger.error(`Error in getNonprofitDetails: ${error.message}`, { error });
    next(error);
  }
};

exports.createFundraiser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fundraiserData = req.body;
    const apiKey = process.env.EVERY_ORG_PRIVATE_KEY;
    const data = await everyorgService.createFundraiser(fundraiserData, apiKey);
    logger.info(`Successfully created fundraiser for nonprofit ID: ${fundraiserData.nonprofitId}`);
    res.json(data);
  } catch (error) {
    logger.error(`Error in createFundraiser: ${error.message}`, { error });
    next(error);
  }
};

exports.generateDonateLink = (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            identifier,
            amount,
            suggestedAmounts,
            min_value,
            frequency,
            first_name,
            last_name,
            description,
            no_exit,
            success_url,
            exit_url,
            partner_donation_id,
            partner_metadata,
            require_share_info,
            share_info,
            designation,
            webhook_token,
            theme_color,
            method
        } = req.body;

        let donateLink = `https://www.every.org/${identifier}#donate`;

        const params = new URLSearchParams();

        if (amount) params.append('amount', amount);
        if (suggestedAmounts) params.append('suggestedAmounts', suggestedAmounts);
        if (min_value) params.append('min_value', min_value);
        if (frequency) params.append('frequency', frequency);
        if (first_name) params.append('first_name', first_name);
        if (last_name) params.append('last_name', last_name);
        if (description) params.append('description', description);
        if (no_exit) params.append('no_exit', 'true');
        if (success_url) params.append('success_url', success_url);
        if (exit_url) params.append('exit_url', exit_url);
        if (partner_donation_id) params.append('partner_donation_id', partner_donation_id);
        if (partner_metadata) params.append('partner_metadata', partner_metadata);
        if (require_share_info) params.append('require_share_info', 'true');
        if (share_info) params.append('share_info', share_info);
        if (designation) params.append('designation', designation);
        if (webhook_token) params.append('webhook_token', webhook_token);
        if (theme_color) params.append('theme_color', theme_color);
        if (method) params.append('method', method);

        if (params.toString()) {
            donateLink += `?${params.toString()}`;
        }

        logger.info(`Donate link generated for identifier: ${identifier}`);
        res.json({ donateLink });
    } catch (error) {
        logger.error(`Error in generateDonateLink: ${error.message}`, { error });
        res.status(500).json({ error: 'An error occurred while generating the donate link' });
    }
};