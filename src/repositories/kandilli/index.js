const db = require('../../db');
const helpers = require('../../helpers');
const constants = require('../../constants');

module.exports.multiSave = async (data, collection = 'data_v2') => {
	if (data.length < 1) {
		return true;
	}
	const mustInsert = [];
	const data_length = data.length;
	for (let index = 0; index < data_length; index++) {
		if (Number.isNaN(data[index].mag)) {
			continue;
		}
		const find = await this.checkIsInserted(
			data[index].date_time,
			data[index].mag,
			data[index].depth,
			data[index].geojson.coordinates[0],
			data[index].geojson.coordinates[1],
		);
		if (find === false) {
			mustInsert.push(data[index]);
		}
	}
	if (mustInsert.length < 1) {
		return true;
	}
	await new db.MongoDB.CRUD('earthquake', collection).insertMany(mustInsert);
	return true;
};

module.exports.checkIsInserted = async (date_time, mag, depth, lng, lat) => {
	const query = await new db.MongoDB.CRUD('earthquake', 'data_v2').find(
		{
			date_time,
			mag,
			depth,
			'geojson.coordinates.0': lng,
			'geojson.coordinates.1': lat,
		},
		[0, 1],
		{ _id: false, date_time: true },
	);
	if (query.length > 0) {
		return true;
	}
	return false;
};

module.exports.update = async (earhquake_id, update) => {
	return await new db.MongoDB.CRUD('earthquake', 'data_v2').update({ earhquake_id }, { $set: update });
};

module.exports.list = async (
	date_starts = helpers.date.moment.moment().tz('Europe/Istanbul').add(-24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
	date_ends = helpers.date.moment.moment().tz('Europe/Istanbul').format('YYYY-MM-DD HH:mm:ss'),
	skip = 0,
	limit = 0,
	sort = null,
) => {
	const match = { date_time: { $gte: date_starts, $lte: date_ends } };
	const agg = [];
	const agg2 = [];
	agg2.push({ $match: match });
	if (sort) {
		agg2.push({ $sort: sort });
	}
	if (skip > 0) {
		agg.push({ $skip: skip });
	}
	if (limit > 0) {
		agg.push({ $limit: limit });
	}
	const query = await new db.MongoDB.CRUD('earthquake', 'data_v2').aggregate([
		...agg2,
		{
			$facet: {
				data: agg,
				metadata: [{ $count: 'total' }],
			},
		},
	]);
	if (query.length > 0) {
		return query[0];
	}
	return { data: [], metadata: [] };
};
