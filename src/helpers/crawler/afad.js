const axios = require('axios');
const helpers_crawler = require('./helpers');

module.exports.get = async (starts, ends) => {
	try {
		const data = JSON.stringify({
			EventSearchFilterList: [
				{
					FilterType: 9,
					Value: `${ends}T21:00:00.917Z`,
				},
				{
					FilterType: 8,
					Value: `${starts}T21:00:00.917Z`,
				},
			],
			Skip: 0,
			Take: 20,
			SortDescriptor: {
				field: 'eventDate',
				dir: 'desc',
			},
		});

		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: process.env.AFAD_API,
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				Origin: 'https://deprem.afad.gov.tr',
				Referer: 'https://deprem.afad.gov.tr/last-earthquakes',
			},
			data: data,
		};
		const request = await axios.request(config);
		if (request && typeof request.data === 'object' && Array.isArray(request.data.eventList)) {
			return helpers_crawler.afad_models(request.data.eventList);
		}
		return { data: [], metadata: { total: 0 } };
	} catch (error) {
		console.error(error);
		return { data: [], metadata: { total: 0 } };
	}
};
