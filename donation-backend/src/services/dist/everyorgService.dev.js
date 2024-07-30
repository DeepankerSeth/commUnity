"use strict";

var axios = require('axios');

var EVERY_ORG_BASE_URL = 'https://partners.every.org/v0.2';

exports.searchNonprofits = function _callee(searchTerm, apiKey) {
  var take,
      causes,
      response,
      _args = arguments;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          take = _args.length > 2 && _args[2] !== undefined ? _args[2] : 50;
          causes = _args.length > 3 && _args[3] !== undefined ? _args[3] : '';
          _context.next = 4;
          return regeneratorRuntime.awrap(axios.get("".concat(EVERY_ORG_BASE_URL, "/search/").concat(searchTerm), {
            params: {
              apiKey: apiKey,
              take: take,
              causes: causes
            }
          }));

        case 4:
          response = _context.sent;
          return _context.abrupt("return", response.data);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.getNonprofitDetails = function _callee2(identifier, apiKey) {
  var response;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(axios.get("".concat(EVERY_ORG_BASE_URL, "/nonprofit/").concat(identifier), {
            params: {
              apiKey: apiKey
            }
          }));

        case 2:
          response = _context2.sent;
          return _context2.abrupt("return", response.data);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.createFundraiser = function _callee3(fundraiserData, apiKey) {
  var response;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(axios.post("".concat(EVERY_ORG_BASE_URL, "/fundraiser"), fundraiserData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': "Bearer ".concat(apiKey)
            }
          }));

        case 2:
          response = _context3.sent;
          return _context3.abrupt("return", response.data);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
};