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

    return router;
};
