'use strict';

var request = require('supertest');

var app = require('../../server');

describe('patient api', function () {
    var api = request.agent(app);
    var patients = [{}, {}, {}, {}, {}];

    var createPatientIt = function (index) {
        var patient = patients[index];

        return function (done) {
            api.post('/fhir/Patient')
                .send(patient)
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

    for (var i = 0; i < patients.length; ++i) {
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
