const helpers = require('../../helpers');
const db = require('../../db');
const constants = require('../../constants');
const helpersCrawler = require('../index');

module.exports.kandilliModels = (data, limit = null) => {
	try {
		const modelData = [];
		const dataLength = data.length;
		for (let index = 0; index < dataLength; index++) {
			if (limit && index + 1 > limit) {
				break;
			}
			let rev = null;
			const title = data[index].title.trim();
			const splitted = title.split(')');
			let finalTitle = title;
			if (splitted && splitted.length > 2) {
				finalTitle = `${splitted[0]})`;
				rev = `${splitted[1]})`.trim();
			}
			const lng = parseFloat(data[index].lng);
			const lat = parseFloat(data[index].lat);
			modelData.push({
				earthquake_id: db.PostgreSQL.id(),
				provider: constants.providers.KANDILLI,
				title: finalTitle,
				mag: parseFloat(data[index].mag),
				depth: parseFloat(data[index].depth),
				geojson: {
					type: 'Point',
					coordinates: [lng, lat],
				},
				location_properties: helpersCrawler.earthquakes.location_properties(lng, lat),
				rev,
				date_time: new helpers.date.kk_date(data[index].date).format('YYYY-MM-DD HH:mm:ss'),
				created_at: parseInt(new helpers.date.kk_date(data[index].date).format('X'), 10),
				location_tz: 'Europe/Istanbul',
			});
		}
		return { data: modelData, metadata: { total: data.length } };
	} catch (error) {
		console.error(error);
		return { data: [], metadata: { total: 0 } };
	}
};

module.exports.afadModels = (data, limit = null) => {
	try {
		const modelData = [];
		const dataLength = data.length;
		for (let index = 0; index < dataLength; index++) {
			if (limit && index + 1 > limit) {
				break;
			}
			const location = data[index].location.trim();
			const lng = parseFloat(data[index].longitude);
			const lat = parseFloat(data[index].latitude);
			modelData.push({
				earthquake_id: db.PostgreSQL.id(),
				provider: constants.providers.AFAD,
				title: location,
				mag: parseFloat(data[index].magnitude),
				depth: parseFloat(data[index].depth),
				geojson: {
					type: 'Point',
					coordinates: [lng, lat],
				},
				location_properties: helpersCrawler.earthquakes.location_properties(lng, lat),
				rev: null,
				date_time: new helpers.date.kk_date(data[index].eventDate).add(3, 'hours').format('YYYY-MM-DD HH:mm:ss'),
				created_at: parseInt(new helpers.date.kk_date(data[index].eventDate).add(3, 'hours').format('X'), 10),
				location_tz: 'Europe/Istanbul',
			});
		}
		return { data: modelData, metadata: { total: data.length } };
	} catch (error) {
		console.error(error);
		return { data: [], metadata: { total: 0 } };
	}
};
