const { Pool } = require('pg');
const { customAlphabet } = require('nanoid');
const constants = require('../constants');

let pool;
let retry = 0;
const maxRetry = 3;

module.exports.connector = async (connectionString = null) => {
	if (retry < maxRetry) {
		try {
			retry++;
			const config = connectionString
				? { connectionString }
				: {
						user: process.env.POSTGRES_USER,
						password: process.env.POSTGRES_PASS,
						host: process.env.POSTGRES_HOST,
						port: process.env.POSTGRES_PORT,
						database: process.env.POSTGRES_DB,
						max: 20,
						idleTimeoutMillis: 30000,
						connectionTimeoutMillis: 5000,
					};
			pool = new Pool(config);
			await pool.query('SELECT 1');
			console.log('PostgreSQL -> Connected');
			return pool;
		} catch (error) {
			console.error(error);
		}
	}
	if (maxRetry >= retry) {
		console.error('PostgreSQL -> NOT CONNECT');
	}
	pool = null;
};

module.exports.getPool = () => pool;

class CRUD {
	constructor(schema, table) {
		if (!pool) {
			throw new constants.errors.ServerError('db.connector', 'db connection error !');
		}
		this.schema = schema;
		this.table = table;
		if (process.env.NODE_ENV === constants.STAGES.DEV) {
			this.schema = `dev_${this.schema}`;
		}
		this.fullTable = `"${this.schema}"."${this.table}"`;
	}

	async find(query = {}, limit = [0, 10], project = {}, sort = {}, collation = {}) {
		const { whereClause, values } = this._buildWhereClause(query);
		const selectFields = this._buildSelectFields(project);
		const orderBy = this._buildOrderBy(sort);

		const sql = `SELECT ${selectFields} FROM ${this.fullTable} ${whereClause} ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
		values.push(limit[1], limit[0]);

		const result = await pool.query(sql, values);
		return result.rows;
	}

	async count(query = {}) {
		const { whereClause, values } = this._buildWhereClause(query);
		const sql = `SELECT COUNT(*) as count FROM ${this.fullTable} ${whereClause}`;
		const result = await pool.query(sql, values);
		return parseInt(result.rows[0].count, 10);
	}

	async insert(data) {
		const columns = Object.keys(data);
		const values = Object.values(data).map((v) => (typeof v === 'object' ? JSON.stringify(v) : v));
		const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

		const sql = `INSERT INTO ${this.fullTable} (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})`;
		await pool.query(sql, values);
		return true;
	}

	async insertMany(dataArray) {
		if (!Array.isArray(dataArray) || dataArray.length === 0) {
			return false;
		}

		const columns = Object.keys(dataArray[0]);
		const values = [];
		const valuePlaceholders = [];

		dataArray.forEach((data, rowIndex) => {
			const rowPlaceholders = columns.map((col, colIndex) => {
				const value = data[col];
				values.push(typeof value === 'object' ? JSON.stringify(value) : value);
				return `$${rowIndex * columns.length + colIndex + 1}`;
			});
			valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
		});

		const sql = `INSERT INTO ${this.fullTable} (${columns.map((c) => `"${c}"`).join(', ')}) VALUES ${valuePlaceholders.join(', ')}`;
		await pool.query(sql, values);
		return true;
	}

	async update(query = null, update = null, multiple = false) {
		const setData = update.$set || update;
		const setClauses = [];
		const values = [];
		let paramIndex = 1;

		for (const [key, value] of Object.entries(setData)) {
			setClauses.push(`"${key}" = $${paramIndex}`);
			values.push(typeof value === 'object' ? JSON.stringify(value) : value);
			paramIndex++;
		}

		const { whereClause, values: whereValues } = this._buildWhereClause(query, paramIndex);
		values.push(...whereValues);

		const sql = `UPDATE ${this.fullTable} SET ${setClauses.join(', ')} ${whereClause}`;
		await pool.query(sql, values);
		return true;
	}

	async delete(query) {
		const { whereClause, values } = this._buildWhereClause(query);
		const sql = `DELETE FROM ${this.fullTable} ${whereClause}`;
		await pool.query(sql, values);
		return true;
	}

	async aggregate(pipeline) {
		const values = [];
		let paramIndex = 1;
		let selectFields = '*';
		let whereClause = '';
		let groupBy = '';
		let orderBy = '';
		let limitClause = '';
		let offsetClause = '';

		for (const stage of pipeline) {
			if (stage.$match) {
				const result = this._buildWhereClause(stage.$match, paramIndex);
				whereClause = result.whereClause;
				values.push(...result.values);
				paramIndex += result.values.length;
			}
			if (stage.$sort) {
				orderBy = this._buildOrderBy(stage.$sort);
			}
			if (stage.$skip) {
				offsetClause = `OFFSET ${stage.$skip}`;
			}
			if (stage.$limit) {
				limitClause = `LIMIT ${stage.$limit}`;
			}
			if (stage.$project) {
				selectFields = this._buildSelectFields(stage.$project);
			}
			if (stage.$group) {
				const { groupSql, groupByClause } = this._buildGroupBy(stage.$group);
				selectFields = groupSql;
				groupBy = groupByClause;
			}
		}

		let sql = `SELECT ${selectFields} FROM ${this.fullTable} ${whereClause} ${groupBy} ${orderBy} ${limitClause} ${offsetClause}`.trim();

		const result = await pool.query(sql, values);
		return result.rows;
	}

	async raw(sql, values = []) {
		const result = await pool.query(sql, values);
		return result.rows;
	}

	_buildWhereClause(query, startIndex = 1) {
		const conditions = [];
		const values = [];
		let paramIndex = startIndex;

		for (const [key, value] of Object.entries(query)) {
			if (value === null || value === undefined) continue;

			const columnName = this._parseColumnName(key);

			if (typeof value === 'object' && !Array.isArray(value)) {
				for (const [op, opValue] of Object.entries(value)) {
					switch (op) {
						case '$gte':
							conditions.push(`${columnName} >= $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
							break;
						case '$lte':
							conditions.push(`${columnName} <= $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
							break;
						case '$gt':
							conditions.push(`${columnName} > $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
							break;
						case '$lt':
							conditions.push(`${columnName} < $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
							break;
						case '$ne':
							conditions.push(`${columnName} != $${paramIndex}`);
							values.push(opValue);
							paramIndex++;
							break;
						case '$in':
							const inPlaceholders = opValue.map((_, i) => `$${paramIndex + i}`).join(', ');
							conditions.push(`${columnName} IN (${inPlaceholders})`);
							values.push(...opValue);
							paramIndex += opValue.length;
							break;
					}
				}
			} else {
				conditions.push(`${columnName} = $${paramIndex}`);
				values.push(typeof value === 'object' ? JSON.stringify(value) : value);
				paramIndex++;
			}
		}

		const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
		return { whereClause, values };
	}

	_parseColumnName(key) {
		if (key.includes('.')) {
			const parts = key.split('.');
			const lastPart = parts.pop();
			if (!isNaN(lastPart)) {
				return `("${parts.join('_')}"->>${lastPart})`;
			}
			return `"${parts[0]}"->>'${parts.slice(1).join("'->'")}'`;
		}
		return `"${key}"`;
	}

	_buildSelectFields(project) {
		const keys = Object.keys(project);
		if (keys.length === 0) return '*';

		const included = keys.filter((k) => project[k] === true || project[k] === 1);
		const excluded = keys.filter((k) => project[k] === false || project[k] === 0);

		if (included.length > 0) {
			return included.map((k) => `"${k}"`).join(', ');
		}
		return '*';
	}

	_buildOrderBy(sort) {
		const keys = Object.keys(sort);
		if (keys.length === 0) return '';

		const orderParts = keys.map((key) => {
			const direction = sort[key] === 1 ? 'ASC' : 'DESC';
			return `"${key}" ${direction}`;
		});

		return `ORDER BY ${orderParts.join(', ')}`;
	}

	_buildGroupBy(group) {
		const selectParts = [];
		let groupByClause = '';

		if (group._id === null) {
			selectParts.push('NULL as _id');
		} else if (typeof group._id === 'string' && group._id.startsWith('$')) {
			const field = group._id.substring(1);
			selectParts.push(`"${field}" as _id`);
			groupByClause = `GROUP BY "${field}"`;
		}

		for (const [key, value] of Object.entries(group)) {
			if (key === '_id') continue;

			if (value.$sum) {
				if (value.$sum === 1) {
					selectParts.push(`COUNT(*) as "${key}"`);
				} else if (typeof value.$sum === 'string' && value.$sum.startsWith('$')) {
					const field = value.$sum.substring(1);
					selectParts.push(`SUM("${field}") as "${key}"`);
				}
			}
			if (value.$avg) {
				const field = value.$avg.substring(1);
				selectParts.push(`AVG("${field}") as "${key}"`);
			}
			if (value.$min) {
				const field = value.$min.substring(1);
				selectParts.push(`MIN("${field}") as "${key}"`);
			}
			if (value.$max) {
				const field = value.$max.substring(1);
				selectParts.push(`MAX("${field}") as "${key}"`);
			}
		}

		return { groupSql: selectParts.join(', '), groupByClause };
	}
}

module.exports.id = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 13);
module.exports.CRUD = CRUD;
