'use strict';

var express = require('express');
var bp = require('body-parser');
var _ = require('lodash');

var routerFactory = require('../routes/routerFactory');
var defaultConfig = require('../config/config.json');

var catchAllErrHandler = require('../middleware/catchAllErrHandler');

var dbmw = function (config) {
    var bbr = require('blue-button-record');
    var initialized = false;

    return function (req, res, next) {
        if (initialized) {
            next();
        } else {
            var dbConfig = _.assign({}, config.db, {
                fhir: true
            });
            bbr.connectDatabase(config.server.host, dbConfig, function (err) {
                req.app.set('connection', bbr);
                initialized = true;
                next(err);
            });
        }
    };
};

module.exports = function (overrideConfig, me, protect) {
    var config = _.merge({}, defaultConfig, overrideConfig);

    var app = me || express();

    app.use(bp.json({
        'strict': false
    }));

    if (config.dbware) {
        app.use(config.dbware);
    } else {
        app.use(dbmw(config));
    }
    app.use(config.server.fhirUrl, routerFactory(config.conformance, protect));

    app.get(config.server.fhirUrl + '/config', function (req, res) {
        res.status(200);
        res.send(config);
    });

    if( typeof(config.useCatchAll) === 'undefined' || config.useCatchAll) { app.use(catchAllErrHandler); }
    return app;
};
