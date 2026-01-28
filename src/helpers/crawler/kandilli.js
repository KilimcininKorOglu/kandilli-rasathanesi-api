const axios = require('axios');
const helpersCrawler = require('./helpers');
const helpers = require('../../helpers');
const constants = require('../../constants');

function parseKandilliHtml(html) {
	const earthquakes = [];
	const lines = html.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('-') || trimmed.startsWith('Date')) continue;

		const match = trimmed.match(
			/^(\d{4}\.\d{2}\.\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+(.+)$/,
		);

		if (match) {
			const [, date, time, lat, lng, depth, , ml, , region] = match;
			const magnitude = parseFloat(ml);
			if (isNaN(magnitude) || magnitude <= 0) continue;

			earthquakes.push({
				date: `${date} ${time}`,
				lat: lat,
				lng: lng,
				depth: depth,
				mag: ml === '-.-' ? '0' : ml,
				title: region.replace(/\s+Quick$/, '').trim(),
			});
		}
	}

	return earthquakes;
}

module.exports.get = async (limit = null) => {
	try {
		const response = await axios.get(`${process.env.KANDILLI_URL}?v=${new helpers.date.kk_date().format('x')}`, {
			timeout: 10000,
			responseType: 'text',
		});

		if (!response || !response.data) {
			throw new constants.errors.ServerError('helpers.crawler.kandilli.get', 'Kandilli fetch error!');
		}

		const preMatch = response.data.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
		if (!preMatch) {
			throw new constants.errors.ServerError('helpers.crawler.kandilli.get', 'Kandilli data format error!');
		}

		const earthquakes = parseKandilliHtml(preMatch[1]);
		if (earthquakes.length === 0) {
			return { data: [], metadata: { total: 0 } };
		}

		return helpersCrawler.kandilliModels(earthquakes, limit);
	} catch (error) {
		console.error('Kandilli crawler error:', error.message);
		return { data: [], metadata: { total: 0 } };
	}
};
