const express = require('express');
const db = require('../db');
const router = express.Router();

const services = require('../services');
const controller = require('../controller');
const repositories = require('../repositories');
const constants = require('../constants');

const int = require('./int');
const kandilli = require('./kandilli');
const statics = require('./statics');
const data = require('./data');

router.use('/deprem/int', int);
router.use('/deprem/kandilli', kandilli);
router.use('/deprem/statics', statics);
router.use('/deprem/data', data);

/**
 * GET /deprem/status
 * @summary api STATUS
 * @tags INT
 * @return {object} 200 - success response - application/json
 * @return {object} 500 - Server error - application/json
 */
router.get('/deprem/status', async (req, res) => {
	const response = constants.response();
	response.desc = 'kandilli son depremler api service';
	response.stats = await repositories.rate.stats();
	response.nopeRedis = db.nopeRedis.stats({ showKeys: false, showTotal: true, showSize: true });
	return res.json(response);
});

/**
 *      !!!!  It has been added for compatibility for those using the old endpoint !!!!
 *      !!!! WILL BE DISABLED IN TIME !!!!
 */
router.get('/deprem/', [controller.kandilli.live], services.kandilli.live);
router.get('/deprem/live.php', [controller.kandilli.live], services.kandilli.live);
router.get('/deprem/index.php', [controller.kandilli.live], services.kandilli.live);

module.exports = router;
