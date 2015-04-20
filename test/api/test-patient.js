'use strict';

var request = require('supertest');
var chai = require('chai');

var expect = chai.expect;
var fhirApp = require('../../lib/app');
var patientSamples = require('../samples/patient-samples')();

describe('patient api', function () {
    var app;
    var server;
    var api;

    before(function (done) {
        app = fhirApp({
            db: {
                "dbName": "fhirpatientapi"
            }
        });
        server = app.listen(3001, done);
        api = request.agent(app);
    });

    it('check config (inits database as well)', function (done) {
        api.get('/config')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    expect(res.body.db.dbName).to.equal("fhirpatientapi");
                    done();
                }
            });
    });

    it('clear database', function (done) {
        var c = app.get('connection');
        c.clearDatabase(done);
    });

    var patients = {};

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
                        var id = res.header.location;
                        patientSample.id = id;
                        patients[id] = patientSample;
                        done();
                    }
                });
        };
    };

    var n = patientSamples.length;
    for (var i = 0; i < n; ++i) {
        it('create ' + i, createPatientIt(i));
    }

    it('search (no param)', function (done) {
        api.get('/fhir/Patient')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                } else {
                    var bundle = res.body;
                    expect(bundle.entry).to.have.length(n);
                    for (var j = 0; j < n; ++j) {
                        var dbPatient = bundle.entry[j].resource;
                        expect(dbPatient).to.deep.equal(patients[dbPatient.id]);
                    }
                    done();
                }
            });
    });

    var readIt = function (index) {
        return function (done) {
            var patientSample = patientSamples[index];
            var id = patientSample.id;

            api.get('/fhir/Patient/' + id)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var resource = res.body;
                        expect(resource).to.deep.equal(patientSample);
                        done();
                    }
                });
        };
    };

    for (var j = 0; j < n; ++j) {
        it('read ' + i, readIt(j));
    }

    it('clear database', function (done) {
        var c = app.get('connection');
        c.clearDatabase(done);
    });

    after(function (done) {
        var c = app.get('connection');
        c.disconnect(function (err) {
            if (err) {
                done(err);
            } else {
                server.close(done);
            }
        });
    });
});
