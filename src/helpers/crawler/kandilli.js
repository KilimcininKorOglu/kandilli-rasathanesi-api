const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const helpers_crawler = require('./helpers');
const helpers = require('../../helpers');
const constants = require('../../constants');

const alwaysArray = ['earhquake.eqlist'];

module.exports.get = async (limit = null) => {
	const parser = new XMLParser({
		ignoreAttributes: false,
		ignoreDeclaration: true,
		ignorePiTags: true,
		attributeNamePrefix: '@_',
		isArray: (name, jpath) => {
			if (alwaysArray.indexOf(jpath) !== -1) return true;
		},
	});
	const response = await axios.get(`${process.env.KANDILLI_XML}?v=${helpers.date.moment.timestampMS()}`);
	if (!response || !response.data) {
		throw new constants.errors.ServerError('helpers.crawler.get', 'Kandilli fetch error !');
	}
	const data = parser.parse(response.data);
	if (!data.eqlist || !data.eqlist.earhquake) {
		throw new constants.errors.ServerError('helpers.crawler.get', 'Kandilli data error !');
	}
	if (!Array.isArray(data.eqlist.earhquake)) {
		throw new constants.errors.ServerError('helpers.crawler.get', 'Kandilli data is not array error !');
	}
	return helpers_crawler.kandilli_models(data.eqlist.earhquake.reverse(), limit);
};

module.exports.getByDate = async (date) => {
	const parser = new XMLParser({
		ignoreAttributes: false,
		ignoreDeclaration: true,
		ignorePiTags: true,
		attributeNamePrefix: '@_',
		isArray: (name, jpath) => {
			if (alwaysArray.indexOf(jpath) !== -1) return true;
		},
	});
	const response = await axios.get(`${process.env.KANDILLI_DATE_XML}${date}.xml?v=${helpers.date.moment.timestampMS()}`);
	if (!response || !response.data) {
		throw new constants.errors.ServerError('helpers.crawler.getByDate', 'Kandilli fetch error !');
	}
	const data = parser.parse(response.data);
	if (!data.eqlist || !data.eqlist.earhquake) {
		throw new constants.errors.ServerError('helpers.crawler.getByDate', 'Kandilli data error !');
	}
	if (!Array.isArray(data.eqlist.earhquake)) {
		throw new constants.errors.ServerError('helpers.crawler.getByDate', 'Kandilli data is not array error !');
	}
	return helpers_crawler.kandilli_models(data.eqlist.earhquake.reverse());
};
