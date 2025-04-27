const db = require('../../db');
const helpers = require('../../helpers');
const constants = require('../../constants');

module.exports.check = async (ip) => {
	if (constants.CONFIG.BYPASS_IPS.includes(ip)) {
		return true;
	}
	const count = await this.count(ip);
	this.delete();
	if (count >= 40) {
		throw new constants.errors.TooManyRequest(
			'repositories.rate.check',
			'Too Many Request in 1 minute! Requests limited in 1 minute maximum 40 times',
		);
	}
	this.save(ip);
	return true;
};

module.exports.count = async (ip) => {
	return await new db.MongoDB.CRUD('earthquake', 'requests').count({
		ip: `${ip}`,
		created_at: { $gte: new helpers.kk_date().add(-1, 'minutes').format('X') },
	});
};

module.exports.save = async (ip) => {
	await new db.MongoDB.CRUD('earthquake', 'requests').insert({
		ip: `${ip}`,
		created_at: new helpers.kk_date().format('X'),
	});
	return true;
};

module.exports.delete = async () => {
	new db.MongoDB.CRUD('earthquake', 'requests').delete({ created_at: { $lte: new helpers.kk_date().add(-1, 'minutes').format('X') } });
	return true;
};

module.exports.stats = async () => {
	const result = {
		total_request_ip: 0,
		total_request: 0,
	};
	const data = await new db.MongoDB.CRUD('earthquake', 'requests').aggregate([
		{
			$group: {
				_id: '$ip',
				total: {
					$sum: 1,
				},
			},
		},
		{
			$group: {
				_id: null,
				total_ip: {
					$sum: 1,
				},
				total: {
					$sum: '$total',
				},
			},
		},
	]);
	if (data.length > 0) {
		result.total_request_ip = data[0].total_ip;
		result.total_request = data[0].total;
	}
	return result;
};
