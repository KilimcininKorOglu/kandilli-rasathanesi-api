/* eslint-disable no-inner-declarations */
const helpers = require('../../helpers');
const repositories = require('../../repositories');
const constants = require('../../constants');
const db = require('../../db');

module.exports = async (req, res) => {
	const responseBody = constants.response();
	responseBody.serverloadms = new helpers.date.kk_date().format('x');
	try {
		const key = `allProviders/live/${req.query.skip}/${req.query.limit}`;
		const check_noperedis = db.nopeRedis.getItem(key);
		let data = [];
		if (check_noperedis) {
			data = check_noperedis;
		} else {
			data = await repositories.data.search(
				{ date_time: { $gte: req.query.date, $lte: req.query.date_end } },
				null,
				{ date_time: -1 },
				req.query.skip,
				req.query.limit,
				{ _id: false },
			);
			db.nopeRedis.setItem(key, data, 30);
		}

		responseBody.result = data;
	} catch (error) {
		console.error(error);
		responseBody.desc = error.message || '';
		responseBody.status = false;
		responseBody.httpStatus = 500;
	}
	responseBody.serverloadms = new helpers.date.kk_date().format('x') - responseBody.serverloadms;
	return res.status(responseBody.httpStatus).json(responseBody);
};
