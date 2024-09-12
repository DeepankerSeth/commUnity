"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDonateLink = exports.createFundraiser = exports.getNonprofitDetails = exports.searchNonprofits = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _expressValidator = require("express-validator");

var everyorgService = _interopRequireWildcard(require("../services/everyorgService.js"));

var _logger = _interopRequireDefault(require("../utils/logger.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var EVERY_ORG_BASE_URL = 'https://partners.every.org/v0.2';
var EVERY_ORG_PRIVATE_API_KEY = process.env.EVERY_ORG_PRIVATE_API_KEY;

var everyorgClient = _axios["default"].create({
  baseURL: EVERY_ORG_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': "Bearer ".concat(EVERY_ORG_PRIVATE_API_KEY)
  }
});

var searchNonprofits = function searchNonprofits(req, res, next) {
  var errors, searchTerm, _req$query, take, causes, data;

  return regeneratorRuntime.async(function searchNonprofits$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          errors = (0, _expressValidator.validationResult)(req);

          if (errors.isEmpty()) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            errors: errors.array()
          }));

        case 4:
          searchTerm = req.params.searchTerm;
          _req$query = req.query, take = _req$query.take, causes = _req$query.causes;
          _context.next = 8;
          return regeneratorRuntime.awrap(everyorgService.searchNonprofits(searchTerm, EVERY_ORG_PRIVATE_API_KEY, take, causes));

        case 8:
          data = _context.sent;

          _logger["default"].info("Successfully searched nonprofits with term: ".concat(searchTerm));

          res.json(data);
          _context.next = 17;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);

          _logger["default"].error("Error in searchNonprofits: ".concat(_context.t0.message), {
            error: _context.t0
          });

          next(_context.t0);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
};

exports.searchNonprofits = searchNonprofits;

var getNonprofitDetails = function getNonprofitDetails(req, res, next) {
  var errors, identifier, data;
  return regeneratorRuntime.async(function getNonprofitDetails$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          errors = (0, _expressValidator.validationResult)(req);

          if (errors.isEmpty()) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            errors: errors.array()
          }));

        case 4:
          identifier = req.params.identifier;
          _context2.next = 7;
          return regeneratorRuntime.awrap(everyorgService.getNonprofitDetails(identifier, EVERY_ORG_PRIVATE_API_KEY));

        case 7:
          data = _context2.sent;

          _logger["default"].info("Successfully retrieved nonprofit details for identifier: ".concat(identifier));

          res.json(data);
          _context2.next = 16;
          break;

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);

          _logger["default"].error("Error in getNonprofitDetails: ".concat(_context2.t0.message), {
            error: _context2.t0
          });

          next(_context2.t0);

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
};

exports.getNonprofitDetails = getNonprofitDetails;

var createFundraiser = function createFundraiser(req, res, next) {
  var errors, fundraiserData, data;
  return regeneratorRuntime.async(function createFundraiser$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          errors = (0, _expressValidator.validationResult)(req);

          if (errors.isEmpty()) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            errors: errors.array()
          }));

        case 4:
          fundraiserData = req.body;
          _context3.next = 7;
          return regeneratorRuntime.awrap(everyorgService.createFundraiser(fundraiserData, EVERY_ORG_PRIVATE_API_KEY));

        case 7:
          data = _context3.sent;

          _logger["default"].info("Successfully created fundraiser for nonprofit ID: ".concat(fundraiserData.nonprofitId));

          res.json(data);
          _context3.next = 16;
          break;

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](0);

          _logger["default"].error("Error in createFundraiser: ".concat(_context3.t0.message), {
            error: _context3.t0
          });

          next(_context3.t0);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 12]]);
};

exports.createFundraiser = createFundraiser;

var generateDonateLink = function generateDonateLink(req, res) {
  try {
    var errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    var _req$body = req.body,
        identifier = _req$body.identifier,
        amount = _req$body.amount,
        suggestedAmounts = _req$body.suggestedAmounts,
        min_value = _req$body.min_value,
        frequency = _req$body.frequency,
        first_name = _req$body.first_name,
        last_name = _req$body.last_name,
        description = _req$body.description,
        no_exit = _req$body.no_exit,
        success_url = _req$body.success_url,
        exit_url = _req$body.exit_url,
        partner_donation_id = _req$body.partner_donation_id,
        partner_metadata = _req$body.partner_metadata,
        require_share_info = _req$body.require_share_info,
        share_info = _req$body.share_info,
        designation = _req$body.designation,
        webhook_token = _req$body.webhook_token,
        theme_color = _req$body.theme_color,
        method = _req$body.method;
    var donateLink = "https://www.every.org/".concat(identifier, "#donate");
    var params = new URLSearchParams();
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
      donateLink += "?".concat(params.toString());
    }

    _logger["default"].info("Donate link generated for identifier: ".concat(identifier));

    res.json({
      donateLink: donateLink
    });
  } catch (error) {
    _logger["default"].error("Error in generateDonateLink: ".concat(error.message), {
      error: error
    });

    res.status(500).json({
      error: 'An error occurred while generating the donate link'
    });
  }
};

exports.generateDonateLink = generateDonateLink;