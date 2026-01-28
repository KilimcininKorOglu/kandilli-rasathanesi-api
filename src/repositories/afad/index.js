const db = require('../../db');
const helpers = require('../../helpers');
const constants = require('../../constants');

module.exports.update = async (earthquakeId, update) => {
	return await new db.PostgreSQL.CRUD('earthquake', 'data_v2').update({ earthquake_id: earthquakeId }, { $set: update });
};

module.exports.list = async (
	dateStarts = new helpers.date.kk_date().add(-24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
	dateEnds = new helpers.date.kk_date().format('YYYY-MM-DD HH:mm:ss'),
	skip = 0,
	limit = 0,
	sort = null,
) => {
	const agg = [{ $match: { date_time: { $gte: dateStarts, $lte: dateEnds }, provider: constants.providers.AFAD } }];
	if (sort) {
		agg.push({ $sort: sort });
	}
	if (skip > 0) {
		agg.push({ $skip: skip });
	}
	if (limit > 0) {
		agg.push({ $limit: limit });
	}
	const query = await new db.PostgreSQL.CRUD('earthquake', 'data_v2').aggregate(agg);
	if (query.length > 0) {
		return { data: query, metadata: [{ count: query.length }] };
	}
	return { data: [], metadata: [{ count: 0 }] };
};
