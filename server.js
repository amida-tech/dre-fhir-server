'use strict';

var express = require('express');

var fhirRouter = require('./lib/fhirRouter');

var app = express();

app.use('/fhir', fhirRouter());

app.listen(3001);
console.log('listening for requests on port 3001');

module.exports = app;
