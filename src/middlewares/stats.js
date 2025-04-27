const constants = require('../constants');

/**
 * This middleware for auth mechanism.
 */
module.exports = async (req, res, next) => {
	const response = constants.response();

	try {
		if (!req.headers.authorization) {
			throw new constants.errors.Forbidden('middlewares.stats', 'authorization not found !');
		}

		if (req.headers.authorization !== constants.CONFIG.STATS_KEY) {
			throw new constants.errors.UnAuth('middlewares.stats', 'authorization invalid !');
		}

		return next();
	} catch (error) {
		console.error(error);
		response.desc = error.message || '';
		response.status = false;
		response.httpStatus = error.httpStatus || 500;
		return res.status(response.httpStatus).json(response);
	}
};
