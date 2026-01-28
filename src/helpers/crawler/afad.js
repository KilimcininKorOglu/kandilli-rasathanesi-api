const axios = require('axios');
const helpersCrawler = require('./helpers');

module.exports.get = async (starts, ends, take = 100) => {
	try {
		const requestData = {
			EventSearchFilterList: [
				{
					FilterType: 8,
					Value: `${starts}T00:00:00.000Z`,
				},
				{
					FilterType: 9,
					Value: `${ends}T23:59:59.000Z`,
				},
			],
			Skip: 0,
			Take: take,
			SortDescriptor: {
				field: 'eventDate',
				dir: 'desc',
			},
		};

		const response = await axios.post(process.env.AFAD_API, requestData, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Origin: 'https://deprem.afad.gov.tr',
				Referer: 'https://deprem.afad.gov.tr/last-earthquakes',
			},
			timeout: 10000,
		});

		if (response && response.data && Array.isArray(response.data.eventList)) {
			return helpersCrawler.afadModels(response.data.eventList);
		}
		return { data: [], metadata: { total: 0 } };
	} catch (error) {
		console.error('AFAD crawler error:', error.message);
		return { data: [], metadata: { total: 0 } };
	}
};
