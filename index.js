// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require('./config');
const fs = require("fs");

// Instantiating http server
const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});
// Starting http server
httpServer.listen(config.httpPort, function () {
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode now `)
});

// Instantiating https server
let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Starting https server
httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode now `)
});

// Common logic for http and https serve
let unifiedServer = (req, res) => {

    // Get and parse URL
    let parsedUrl = url.parse(req.url, true);

    // Get path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    let queryStringObject = parsedUrl.query;

    // Get the HTTP method
    let method = req.method.toLowerCase();

    // Get the headers as an object
    let headers = req.headers;

    // Get payload if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct data object to send back
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            payload = typeof(payload) === 'object' ? payload : {};

            let payloadString = JSON.stringify(payload);

            // Send response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning response ', statusCode, payloadString)
        })
    })
};

// Define handlers
let handlers = {};

// Handles /ping route
handlers.ping = (data, cb) => {
    cb(200);
};

handlers.hello = (data, cb) => {
    cb(200, {
        'message': 'Hi there man!'
    })
}

// Handle any unknown route
handlers.notFound = (data, cb) => {
    cb(404);
};

// Define a request router
let router = {
    'ping': handlers.ping,
    'hello': handlers.hello
};