'use strict';

var express = require('express');

var patientHandler = require('../models/patient');
var fpp = require('../middleware/fhir-param-parser');

module.exports = function () {
    var router = express.Router({
        caseSensitive: true
    });

    router.post('/Patient', function (req, res) {
        var patient = req.body;
        var c = req.app.get('connection');
        patientHandler.create(c, patient, function (err, id) {
            if (err) {
                res.status(400);
                res.send(err);
            } else {
                var location = [req.baseUrl, 'Patient', id, '_history', '1'].join('/');
                res.status(201);
                res.location(location);
                res.header('ETag', '1');
                res.send();
            }
        });
    });

    var search = function (req, res) {
        var c = req.app.get('connection');
        var params = req.fhirParams || {};
        patientHandler.search(c, params, function (err, bundle) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                Object.keys(req.query).forEach(function (key) {
                    res.set(key, req.query[key]);
                });
                res.send(bundle);
            }
        });
    };

    var searchParam = [{
        name: '_id',
        type: 'string'
    }, {
        name: 'family',
        type: 'string'
    }, {
        name: 'birthDate',
        type: 'date'
    }];
    var mw = fpp(searchParam);

    router.get('/Patient', mw, search);
    router.post('/Patient/_search', mw, search);

    router.get('/Patient/:id', function (req, res) {
        var c = req.app.get('connection');
        var id = req.params.id;

        patientHandler.read(c, id, function (err, resource) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.send(resource);
            }
        });
    });

    router.put('/Patient/:id', function (req, res) {
        var patient = req.body;
        var c = req.app.get('connection');
        var id = req.params.id;

        patientHandler.update(c, patient, function (err) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.send();
            }
        });
    });

    router.delete('/Patient/:id', function (req, res) {
        var c = req.app.get('connection');
        var id = req.params.id;

        patientHandler.delete(c, id, function (err, resource) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.send();
            }
        });
    });

    return router;
};
