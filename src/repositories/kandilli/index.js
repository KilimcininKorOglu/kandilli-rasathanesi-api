const db = require('../../db');
const helpers = require('../../helpers');

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
	date_starts = new helpers.date.kk_date().add(-24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
	date_ends = new helpers.date.kk_date().format('YYYY-MM-DD HH:mm:ss'),
	skip = 0,
	limit = 0,
	sort = null,
) => {
	const agg = [{ $match: { date_time: { $gte: date_starts, $lte: date_ends } } }];
	if (sort) {
		agg.push({ $sort: sort });
	}
	if (skip > 0) {
		agg.push({ $skip: skip });
	}
	if (limit > 0) {
		agg.push({ $limit: limit });
	}
	const query = await new db.MongoDB.CRUD('earthquake', 'data_v2').aggregate(agg);
	if (query.length > 0) {
		return { data: query, metadata: [{ count: query.length }] };
	}
	return { data: [], metadata: [{ count: 0 }] };
};
