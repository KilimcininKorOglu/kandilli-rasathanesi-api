/* eslint-disable no-inner-declarations */
const helpers = require('../../helpers');
const repositories = require('../../repositories');
const constants = require('../../constants');

module.exports = async (req, res) => {
	const responseBody = constants.response();

	try {
		const data = await repositories.data.search(req.body.match, req.body.geoNear, req.body.sort, req.body.skip, req.body.limit, null);
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
