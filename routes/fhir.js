'use strict';

var express = require('express');

var patientHandler = require('../models/patient');

module.exports = function () {
    var router = express.Router();

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
        patientHandler.search(c, null, function (err, bundle) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.send(bundle);
            }
        });
    };

    router.get('/Patient', search);
    router.post('/Patient/_search', search);

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
