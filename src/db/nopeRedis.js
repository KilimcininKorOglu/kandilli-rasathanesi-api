const nopeRedis = require('nope-redis');
nopeRedis.config({
	evictionPolicy: 'lfu',
	maxMemorySize: 100,
	isMemoryStatsEnabled: false,
	defaultTtl: 30,
});
module.exports = nopeRedis;
