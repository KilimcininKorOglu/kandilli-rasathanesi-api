const db = require('../../db');
const helpers = require('../../helpers');

module.exports.check = async (ip) => {
	const count = await this.count(ip);
	this.delete();
	if (count >= 58) {
		throw new Error('Many Request in 1 minute !');
	}
	this.save(ip);
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
