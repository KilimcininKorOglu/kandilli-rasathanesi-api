const db = require('../../db');

module.exports.stats = require('./stats');

module.exports.multiSave = async (data, collection = 'data_v2') => {
	if (data.length < 1) {
		return true;
	}
	const mustInsert = [];
	const dataLength = data.length;
	for (let index = 0; index < dataLength; index++) {
		if (Number.isNaN(data[index].mag)) {
			continue;
		}
		const find = await this.checkIsInserted(
			data[index].provider,
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
	await new db.PostgreSQL.CRUD('earthquake', collection).insertMany(mustInsert);
	return true;
};

module.exports.checkIsInserted = async (provider, dateTime, mag, depth, lng, lat) => {
	const crud = new db.PostgreSQL.CRUD('earthquake', 'data_v2');
	const query = await crud.raw(
		`SELECT date_time FROM "earthquake"."data_v2" 
		WHERE provider = $1 AND date_time = $2 AND mag = $3 AND depth = $4 
		AND (geojson->>'coordinates')::jsonb->>0 = $5 
		AND (geojson->>'coordinates')::jsonb->>1 = $6 
		LIMIT 1`,
		[provider, dateTime, mag, depth, String(lng), String(lat)],
	);
	if (query.length > 0) {
		return true;
	}
	return false;
};

module.exports.search = async (match = null, geoNear = null, sort = null, skip = null, limit = null, project = null) => {
	const agg = [];
	agg.push({ $match: geoNear ? { ...match, ...geoNear } : match });

	if (sort) {
		agg.push({ $sort: sort });
	}
	if (skip && skip > 0) {
		agg.push({ $skip: skip });
	}
	if (limit && limit > 0) {
		agg.push({ $limit: limit });
	}
	if (project) {
		agg.push({ $project: project });
	}
	const query = await new db.PostgreSQL.CRUD('earthquake', 'data_v2').aggregate(agg);
	if (query.length > 0) {
		return query;
	}
	return [];
};

module.exports.get = async (earthquakeId, project = {}) => {
	try {
		const query = await new db.PostgreSQL.CRUD('earthquake', 'data_v2').find({ earthquake_id: earthquakeId }, [0, 1], project);
		if (query.length > 0) {
			return query[0];
		}
		return null;
	} catch (error) {
		console.error(error);
		return false;
	}
};
