// const kk_date = require('kk-date');
// kk_date.caching({ status: true });
// kk_date.config({ timezone: 'Europe/Istanbul', locale: 'tr' });
const kk_date = require('kk-date');
kk_date.caching({ status: true, defaultTtl: 14400 });
kk_date.config({ timezone: 'Europe/Istanbul' });

module.exports.kk_date = kk_date;
