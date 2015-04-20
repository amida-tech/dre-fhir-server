'use strict';

var express = require('express');

var patientHandler = require('./resource/patient');

module.exports = function () {
    var router = express.Router();

    router.post('/Patient', function (req, res) {
        var patient = req.body;
        var c = req.app.get('connection');
        patientHandler.create(c, patient, function (err, id) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.location(id);
                res.send();
            }
        });
    });

    router.get('/Patient', function (req, res) {
        var c = req.app.get('connection');
        patientHandler.search(c, null, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send(bundle);
                }
            }
        });
    });

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
