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

    var createIt = function (index) {
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
        it('create ' + i, createIt(i));
    }

    var searchIt = function (count) {
        return function (done) {
            api.get('/fhir/Patient')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var bundle = res.body;
                        expect(bundle.entry).to.have.length(count);
                        for (var j = 0; j < count; ++j) {
                            var dbPatient = bundle.entry[j].resource;
                            expect(dbPatient).to.deep.equal(patients[dbPatient.id]);
                        }
                        done();
                    }
                });
        };
    };

    it('search (no param)', searchIt(n));

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
        it('read ' + j, readIt(j));
    }

    it('exchange samples 0 <-> 1', function () {
        var patientSample0 = patientSamples[0];
        var patientSample1 = patientSamples[1];
        var id0 = patientSample0.id;
        var id1 = patientSample1.id;
        patientSample0.id = id1;
        patientSample1.id = id0;
        patientSamples[0] = patientSample1;
        patientSamples[1] = patientSample0;
        patients[id1] = patientSample0;
        patients[id0] = patientSample1;
    });

    var updateIt = function (index) {
        return function (done) {
            var patientSample = patientSamples[index];
            var id = patientSample.id;

            api.put('/fhir/Patient/' + id)
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

    for (var k = 0; k < 2; ++k) {
        it('update ' + k, updateIt(k));
        it('read ' + k, readIt(k));
    }

    var deleteIt = function (index) {
        return function (done) {
            var patientSample = patientSamples[index];
            var id = patientSample.id;

            api.delete('/fhir/Patient/' + id)
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

    for (var l = n - 2; l < n; ++l) {
        it('delete ' + l, deleteIt(l));
    }

    it('search (no param)', searchIt(n - 2));

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
