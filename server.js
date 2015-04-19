'use strict';

var app = require('./lib/app');
var config = require('./config.json');

var fhirServer = module.exports = app(config);

fhirServer.listen(config.server.port);
console.log('listening for requests on port ' + config.server.port);
