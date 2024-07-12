const express = require('express');
const { check } = require('express-validator');
const charityController = require('../controllers/charityController');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/search/:searchTerm', [
    check('searchTerm').not().isEmpty().withMessage('Search term is required'),
    validate
], charityController.searchNonprofits);

router.get('/details/:identifier', [
    check('identifier').not().isEmpty().withMessage('Identifier is required'),
    validate
], charityController.getNonprofitDetails);

router.post('/fundraiser', [
    check('nonprofitId').not().isEmpty().withMessage('Nonprofit ID is required'),
    check('title').not().isEmpty().withMessage('Title is required'),
    check('description').not().isEmpty().withMessage('Description is required'),
    validate
], charityController.createFundraiser);

router.post('/donate-link', [
    check('identifier').not().isEmpty().withMessage('Identifier is required'),
    validate
], charityController.generateDonateLink);

module.exports = router;