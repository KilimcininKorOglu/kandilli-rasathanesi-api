const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const cron = require('node-cron');

const app = express();
const helpers = require('./src/helpers');
const db = require('./src/db');
const repositories = require('./src/repositories');
const kandilliCrawler = require('./src/helpers/crawler/kandilli');
const afadCrawler = require('./src/helpers/crawler/afad');
const port = 7980;

// connectors for db, cache etc.;
async function connector() {
	await db.PostgreSQL.connector();
}

connector();

app.set('trust proxy', true);
app.use((req, _res, next) => {
	const ipFromExpress = req.ip;
	const ipFromCF = req.headers['cf-connecting-ip'];
	req.ip = ipFromCF || ipFromExpress;
	next();
});

logger.token('real-ip', (req) => req.ip);
logger.token('datetime', () => new helpers.date.kk_date().format('YYYY-MM-DD HH:mm:ss'));

app.use(cors());
app.use(logger(':datetime - :real-ip - :method :url :status :response-time ms'));
app.use(express.json({ limit: 1000000 }));
app.use(express.urlencoded({ extended: false }));

// Internal routes only
const intRoutes = require('./src/routes/int');
app.use('/deprem/int', intRoutes);

// Health check endpoint for internal service
app.get('/health', (_req, res) => {
	res.json({
		status: true,
		service: 'kandilli-internal',
		port: port,
		timestamp: new helpers.date.kk_date().format('YYYY-MM-DD HH:mm:ss')
	});
});

// Error handling middleware
app.use((err, _req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		console.error(err);
		const response = {
			status: false,
			desc: err.message || '',
			httpStatus: err.httpStatus || 500,
		};
		return res.status(response.httpStatus).send(response);
	}
	return next();
});

// 404 handler
app.use((_req, res) => {
	const response = {
		httpStatus: 404,
		status: false,
		desc: 'No endpoint!'
	};
	return res.status(response.httpStatus).json(response);
});

// Earthquake data fetcher function
async function fetchEarthquakeData() {
	const now = new helpers.date.kk_date();
	const today = now.format('YYYY-MM-DD');
	const yesterday = now.add(-1, 'days').format('YYYY-MM-DD');

	try {
		console.log(`[${now.format('YYYY-MM-DD HH:mm:ss')}] Fetching earthquake data...`);

		// Fetch from Kandilli
		const kandilliResult = await kandilliCrawler.get();
		if (kandilliResult.data.length > 0) {
			await repositories.data.multiSave(kandilliResult.data);
			console.log(`  Kandilli: ${kandilliResult.data.length} earthquakes processed`);
		}

		// Fetch from AFAD
		const afadResult = await afadCrawler.get(yesterday, today, 100);
		if (afadResult.data.length > 0) {
			await repositories.data.multiSave(afadResult.data);
			console.log(`  AFAD: ${afadResult.data.length} earthquakes processed`);
		}

		console.log(`[${new helpers.date.kk_date().format('YYYY-MM-DD HH:mm:ss')}] Fetch completed`);
	} catch (error) {
		console.error('Earthquake fetch error:', error.message);
	}
}

// Run cron job every minute
cron.schedule('* * * * *', fetchEarthquakeData);

// Run once on startup after DB connection
setTimeout(fetchEarthquakeData, 3000);

app.listen(port, () => {
	console.log(`Kandilli Internal Service - PORT: ${port}`);
	console.log('Cron job scheduled: fetching earthquakes every minute');
});