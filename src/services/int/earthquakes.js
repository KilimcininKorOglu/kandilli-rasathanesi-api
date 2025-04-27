/* eslint-disable no-inner-declarations */
const helpers = require('../../helpers');
const repositories = require('../../repositories');
const constants = require('../../constants');

module.exports = async (req, res) => {
	const responseBody = constants.response();
	responseBody.serverloadms = helpers.date.moment.timestampMS();

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
	responseBody.serverloadms = helpers.date.moment.timestampMS() - responseBody.serverloadms;
	return res.status(responseBody.httpStatus).json(responseBody);
};
