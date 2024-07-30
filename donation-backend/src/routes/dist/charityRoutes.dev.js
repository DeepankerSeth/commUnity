"use strict";

var express = require('express');

var _require = require('express-validator'),
    check = _require.check;

var charityController = require('../controllers/charityController');

var validate = require('../middleware/validate');

var router = express.Router();
router.get('/search/:searchTerm', [check('searchTerm').not().isEmpty().withMessage('Search term is required'), check('take').optional().isInt({
  min: 1,
  max: 50
}).withMessage('Take must be between 1 and 50'), check('causes').optional().isString().withMessage('Causes must be a string'), validate], charityController.searchNonprofits);
router.get('/details/:nonprofitId', [check('nonprofitId').not().isEmpty().withMessage('Nonprofit ID is required'), validate], charityController.getNonprofitDetails);
router.post('/fundraiser', [check('nonprofitId').not().isEmpty().withMessage('Nonprofit ID is required'), check('title').not().isEmpty().withMessage('Title is required'), check('description').not().isEmpty().withMessage('Description is required'), validate], charityController.createFundraiser);
router.post('/donate-link', [check('nonprofitId').not().isEmpty().withMessage('Nonprofit ID is required'), validate], charityController.generateDonateLink);
module.exports = router;