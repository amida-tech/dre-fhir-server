'use strict';

var express = require('express');

module.exports = function () {
    var router = express.Router();

    router.post('/Patient', function (req, res) {
        var patient = req.body;

        console.log(JSON.stringify(patient, undefined, 4));

        res.send('');
    });

    router.get('/Patient', function (req, res) {
        res.send('');
    });

    return router;
};
