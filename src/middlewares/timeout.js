module.exports = (timeoutMs = 30000) => {
	return (_req, res, next) => {
		const timeoutId = setTimeout(() => {
			if (!res.headersSent) {
				res.status(408).json({
					status: false,
					httpStatus: 408,
					desc: 'Request timeout - server did not respond in time',
					timeout: timeoutMs,
				});
			}
		}, timeoutMs);

		const originalSend = res.send;
		const originalJson = res.json;
		const originalStatus = res.status;

		const clearTimeoutWrapper = () => {
			clearTimeout(timeoutId);
		};

		res.send = (...args) => {
			clearTimeoutWrapper();
			return originalSend.apply(res, args);
		};

		res.json = (...args) => {
			clearTimeoutWrapper();
			return originalJson.apply(res, args);
		};

		res.status = (...args) => {
			const result = originalStatus.apply(res, args);
			res.send = (...sendArgs) => {
				clearTimeoutWrapper();
				return originalSend.apply(res, sendArgs);
			};
			res.json = (...jsonArgs) => {
				clearTimeoutWrapper();
				return originalJson.apply(res, jsonArgs);
			};
			return result;
		};

		res.on('finish', clearTimeoutWrapper);
		res.on('close', clearTimeoutWrapper);
		res.on('error', clearTimeoutWrapper);

		next();
	};
};
