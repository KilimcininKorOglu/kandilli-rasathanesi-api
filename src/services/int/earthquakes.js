/* eslint-disable no-inner-declarations */
const helpers = require('../../helpers');
const repositories = require('../../repositories');
const constants = require('../../constants');

module.exports = async (_req, res) => {
	const responseBody = constants.response();
	responseBody.serverloadms = new helpers.date.kk_date().format('x');

	try {
		async function start() {
			try {
				const kandilli_data = await helpers.crawler.kandilli.get();
				repositories.kandilli.multiSave(kandilli_data.data);
			} catch (error) {
				console.error(error);
			}
		}
		start();
	} catch (error) {
		console.error(error);
		responseBody.desc = error.message || '';
		responseBody.status = false;
		responseBody.httpStatus = 500;
	}
	responseBody.serverloadms = new helpers.date.kk_date().format('x') - responseBody.serverloadms;
	return res.status(responseBody.httpStatus).json(responseBody);
};
