'use strict';

var express = require('express');
var bp = require('body-parser');
var _ = require('lodash');

var fhirRouter = require('./fhirRouter');
var defaultConfig = require('../config.json');

var errorHandler = function (err, req, res, next) {
    console.log(err);
    res.status(500);
    res.send('internal error');
};

var dbmw = function (config) {
    var bbr = require('blue-button-record');
    var initialized = false;

    return function (req, res, next) {
        if (initialized) {
            next();
        } else {

            bbr.connectDatabase(config.server.host, config.db, function (err) {
                req.app.set('connection', bbr);
                initialized = true;
                next(err);
            });
        }
    };
};

module.exports = function (overrideConfig) {
    var config = _.merge({}, defaultConfig, overrideConfig);

    var app = express();

    app.use(bp.json({
        'strict': false
    }));

    app.use(dbmw(config));
    app.use(config.server.fhirUrl, fhirRouter());

    app.get('/config', function (req, res) {
        res.status(200);
        res.send(config);
    });

    app.use(errorHandler);
    return app;
};
