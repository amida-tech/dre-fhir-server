'use strict';

var request = require('supertest');

var app = require('../../server');
var patientSamples = require('../samples/patient-samples');

describe('patient api', function () {
    var api = request.agent(app);

    var createPatientIt = function (index) {
        var patientSample = patientSamples[index];

        return function (done) {
            api.post('/fhir/Patient')
                .send(patientSample)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        done();
                    }
                });
        };
    };

    var n = patientSamples.length;
    for (var i = 0; i < n; ++i) {
        it('create ' + i, createPatientIt(i));
    }

    it('get all', function (done) {
        api.get('/fhir/Patient')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                } else {
                    done();
                }
            });
    });
});
