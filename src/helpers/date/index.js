const KkDate = require('kk-date');
const kk_date = require('kk-date');
kk_date.caching({ status: true, defaultTtl: 14400 });
KkDate.setUserTimezone('Europe/Istanbul');
kk_date.config({ timezone: 'Europe/Istanbul' });
kk_date.setTimezone('Europe/Istanbul');

module.exports.kk_date = kk_date;
