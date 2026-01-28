const db = require('../../db');
const helpers = require('../../helpers');
const constants = require('../../constants');

module.exports.check = async (ip) => {
	if (constants.CONFIG.BYPASS_IPS.includes(ip)) {
		return true;
	}
	const count = await this.count(ip);
	this.delete();
	if (count >= 100) {
		throw new constants.errors.TooManyRequest(
			'repositories.rate.check',
			'Too Many Request in 1 minute! Requests limited in 1 minute maximum 100 times',
		);
	}
	this.save(ip);
	return true;
};

module.exports.count = async (ip) => {
	return await new db.PostgreSQL.CRUD('earthquake', 'requests').count({
		ip: `${ip}`,
		created_at: { $gte: new helpers.date.kk_date().add(-1, 'minutes').format('X') },
	});
};

module.exports.save = async (ip) => {
	await new db.PostgreSQL.CRUD('earthquake', 'requests').insert({
		ip: `${ip}`,
		created_at: new helpers.date.kk_date().format('X'),
	});
	return true;
};

module.exports.delete = async () => {
	await new db.PostgreSQL.CRUD('earthquake', 'requests').delete({ created_at: { $lte: new helpers.date.kk_date().add(-1, 'minutes').format('X') } });
	return true;
};

module.exports.stats = async () => {
	const result = {
		totalRequestIp: 0,
		totalRequest: 0,
	};
	const crud = new db.PostgreSQL.CRUD('earthquake', 'requests');
	const data = await crud.raw(`
		SELECT COUNT(DISTINCT ip) as total_ip, COUNT(*) as total 
		FROM "earthquake"."requests"
	`);
	if (data.length > 0) {
		result.totalRequestIp = parseInt(data[0].total_ip, 10) || 0;
		result.totalRequest = parseInt(data[0].total, 10) || 0;
	}
	return result;
};
