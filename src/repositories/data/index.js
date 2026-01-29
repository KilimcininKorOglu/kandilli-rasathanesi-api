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
	const crud = new db.PostgreSQL.CRUD('earthquake', 'data_v2');

	// If geoNear is provided, use raw SQL with ST_DWithin
	if (geoNear && geoNear.lon && geoNear.lat && geoNear.radiusMeter) {
		const values = [geoNear.lon, geoNear.lat, geoNear.radiusMeter];
		let paramIndex = 4;

		let whereConditions = [`ST_DWithin(
			ST_SetSRID(ST_MakePoint((geojson->>'coordinates')::jsonb->>0, (geojson->>'coordinates')::jsonb->>1)::geography, 4326)::geography,
			ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
			$3
		)`];

		// Add match conditions
		if (match) {
			for (const [key, value] of Object.entries(match)) {
				if (value === null || value === undefined) continue;
				if (typeof value === 'object' && !Array.isArray(value)) {
					for (const [op, opValue] of Object.entries(value)) {
						if (op === '$gte') {
							whereConditions.push(`"${key}" >= $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
						} else if (op === '$lte') {
							whereConditions.push(`"${key}" <= $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
						}
					}
				} else {
					whereConditions.push(`"${key}" = $${paramIndex}`);
					values.push(value);
					paramIndex++;
				}
			}
		}

		let sql = `SELECT * FROM "earthquake"."data_v2" WHERE ${whereConditions.join(' AND ')}`;

		// Add sorting
		if (sort) {
			const sortParts = Object.entries(sort).map(([key, dir]) => `"${key}" ${dir === 1 ? 'ASC' : 'DESC'}`);
			sql += ` ORDER BY ${sortParts.join(', ')}`;
		}

		// Add pagination
		if (limit && limit > 0) {
			sql += ` LIMIT $${paramIndex}`;
			values.push(limit);
			paramIndex++;
		}
		if (skip && skip > 0) {
			sql += ` OFFSET $${paramIndex}`;
			values.push(skip);
		}

		return await crud.raw(sql, values);
	}

	// Standard query without geoNear
	const agg = [];
	agg.push({ $match: match || {} });

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
	const query = await crud.aggregate(agg);
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
