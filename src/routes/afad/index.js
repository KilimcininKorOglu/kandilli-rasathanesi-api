const express = require('express');
const router = express.Router();
const services = require('../../services');
const controller = require('../../controller');

/**
 * GET /deprem/afad/live
 * @param {number} skip.query - skip param skip
 * @param {number} limit.query - limit param limit
 * @summary api earthquakes live endpoint from afad
 * @tags DEPREM LIST AFAD
 * @return {object} 200 - success response - application/json
 * @return {object} 500 - Server error - application/json
 */
router.get('/live', [controller.afad.live], services.afad.live);

/**
 * GET /deprem/afad/archive
 * @param {number} skip.query - limit param limit
 * @param {number} limit.query - limit param limit
 * @param {string} date.query.required - date param YYYY-MM-DD
 * @param {string} date_end.query - date end param YYYY-MM-DD
 * @summary api earthquakes archive endpoint from afad
 * @tags DEPREM LIST AFAD
 * @return {object} 200 - success response - application/json
 * @return {object} 500 - Server error - application/json
 */
router.get('/archive', [controller.afad.archive], services.afad.archive);

module.exports = router;
