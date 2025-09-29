/* eslint-disable no-inner-declarations */
const helpers = require('../../helpers');
const repositories = require('../../repositories');
const constants = require('../../constants');

module.exports = async (req, res) => {
	const responseBody = constants.response();
	responseBody.serverloadms = new helpers.date.kk_date().format('x');
	responseBody.metadata = {};
	responseBody.result = [];
	try {
		const kandilli_data = await repositories.kandilli.list(req.query.date, req.query.date_end, req.query.skip, req.query.limit);
		if (!kandilli_data) {
			responseBody.status = false;
			responseBody.desc = 'Veri alınamadı!';
		}
		responseBody.result = kandilli_data.data;
		responseBody.metadata = kandilli_data.metadata[0];
	} catch (error) {
		console.error(error);
		responseBody.desc = error.message || '';
		responseBody.status = false;
		responseBody.httpStatus = 500;
	}
	responseBody.serverloadms = new helpers.date.kk_date().format('x') - responseBody.serverloadms;
	return res.status(responseBody.httpStatus).json(responseBody);
};
