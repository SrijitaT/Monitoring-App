const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const router = require('./lib/routes');
const _data = require('./lib/data');
const helpers = require('./lib/helpers');

const unifiedServer = (req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');
	const method = req.method.toLowerCase();
	const headers = req.headers;

	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	//request object emits data event when a http request is made
	req.on('data', data => {
		buffer += decoder.write(data);
	});
	//end event is always going to get called but data event will not always get called
	req.on('end', () => {
		buffer += decoder.end();
		const chosenHandler =
			router[trimmedPath] != undefined ? router[trimmedPath] : router.notFound;

		const data = {
			trimmedPath,
			method,
			headers,
			params: parsedUrl.query,
			payload: helpers.parseJsonToObj(buffer)
		};

		chosenHandler(data, function(statusCode, payload) {
			statusCode = typeof statusCode == 'number' ? statusCode : 200;
			payload = typeof payload == 'object' ? payload : {};
			const payloadStr = JSON.stringify(payload);
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadStr);
			console.log('Returning this response', statusCode);
		});
	});
};

module.exports = unifiedServer;
