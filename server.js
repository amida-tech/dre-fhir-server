'use strict';

var app = require('./config/app');
var config = require('./config/config.json');
var assert = require('assert');

/*var fhirServer = module.exports = app(config);

fhirServer.listen(config.server.port);
console.log('listening for requests on port ' + config.server.port);
*/

/** Configure existing app to support FHIR functionality */
var fhirServer = module.exports = {
	
	/**
	 * Setup routes and the rest of stuff requred for FHIR.
	 * @function
	 * @param {Object} expressApp - App to be configured
	 * @param {Object=} config - Configuration (thettings which are different from defaults)
	 * @param {ExpressCallback|[ExpressCallback]=} protect - Callback(s) executed before protected API endpoints
	 * @returns {Object} - configured App
	 */
	setup: function(expressApp, config, protect) {
		assert(expressApp);
		
		app(config, expressApp, protect);
		return expressApp;
	},
	
	/** 
	 * Setup and start FHIR server with default configuration
	 * @function
	 * @returns {Object} - reference to a running FHIR server
	 */
	serve: function() {
		var fhirServer = app(config, null);

		fhirServer.listen(config.server.port);
		console.log('listening for requests on port ' + config.server.port);
		
		return fhirServer;
	}
};

/**
 * Standard Express's callback.
 * @callback ExpressCallback
 * @param {Object} req - request
 * @param {Object} res - response
 * @param {Function} next - next
 */