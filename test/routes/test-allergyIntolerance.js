'use strict';

var request = require('supertest');
var chai = require('chai');
var _ = require('lodash');

var expect = chai.expect;
var fhirApp = require('../../config/app');
var samples = require('../samples/allergyIntolerance-samples');
var patientSamples = require('../samples/patient-samples')();
var sharedMod = require('./shared');

describe('routes allergyIntolerance', function () {
    var app;
    var server;
    var api;
    var shared;
    var sharedPatient;

    var samplesSet0 = samples.set0();
    var samplesSet1 = samples.set1();

    before(function (done) {
        app = fhirApp({
            db: {
                "dbName": "fhirallergyintoleranceapi"
            }
        });
        server = app.listen(3001, done);
        api = request.agent(app);
        shared = sharedMod({
            app: app,
            server: server,
            api: api,
            dbName: "fhirallergyintoleranceapi",
            resourceType: 'AllergyIntolerance'
        });
        sharedPatient = sharedMod({
            app: app,
            server: server,
            api: api,
            dbName: "fhirallergyintoleranceapi",
            resourceType: 'Patient'
        });
    });

    it('check config (inits database as well)', function (done) {
        shared.getConfig(done);
    });

    it('clear database', function (done) {
        shared.clearDatabase(done);
    });

    it('create with patient missing', function (done) {
        shared.failCreate(samplesSet0[0], done);
    });

    var createPatient = function (index) {
        return function (done) {
            sharedPatient.create(patientSamples[index], done);
        };
    };

    for (var i = 0; i < 2; ++i) {
        it('create patient ' + i, createPatient(i));
    }

    it('assign patients to samples', function () {
        [samplesSet0, samplesSet1].forEach(function (samplesSet, index) {
            var reference = patientSamples[index].id;
            samplesSet.forEach(function (sample) {
                sample.patient = {
                    reference: reference
                };
            });
        });
    });

    var entryMapById = {};
    var entryIds = [];

    var createIt = function (samplesSet, index) {
        var sample = samplesSet[index];

        return function (done) {
            api.post('/fhir/AllergyIntolerance')
                .send(sample)
                .expect(201)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var location = res.header.location;
                        var p = location.split('/');
                        expect(p).to.have.length(6);
                        var id = p[3];
                        p[3] = '';
                        expect(p).to.deep.equal(['', 'fhir', 'AllergyIntolerance', '', '_history', '1']);
                        sample.id = id;
                        entryMapById[id] = sample;
                        entryIds.push(id);
                        done();
                    }
                });
        };
    };

    for (var j0 = 0; j0 < samplesSet0.length; ++j0) {
        it('create for patient-0 ' + j0, createIt(samplesSet0, j0));
    }

    for (var j1 = 0; j1 < samplesSet1.length; ++j1) {
        it('create for patient-1 ' + j1, createIt(samplesSet1, j1));
    }

    var searchIt = function (count, isPost, query) {
        return function (done) {
            var request = isPost ? api.post('/fhir/AllergyIntolerance/_search') : api.get('/fhir/AllergyIntolerance');
            if (query) {
                request.query(query);
            }
            request.expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var bundle = res.body;
                        expect(bundle.entry).to.have.length(count);
                        for (var j = 0; j < count; ++j) {
                            var dbVital = bundle.entry[j].resource;
                            delete dbVital.patient.display;
                            expect(dbVital).to.deep.equal(entryMapById[dbVital.id]);
                        }
                        done();
                    }
                });
        };
    };

    var n = samplesSet0.length + samplesSet1.length;
    it('search (get - no param)', searchIt(n, false));
    it('search (post - no param)', searchIt(n, true));

    var readIt = function (samplesSet, index) {
        return function (done) {
            var sample = samplesSet[index];
            var id = sample.id;

            api.get('/fhir/AllergyIntolerance/' + id)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var resource = res.body;
                        delete resource.patient.display;
                        expect(resource).to.deep.equal(sample);
                        done();
                    }
                });
        };
    };

    for (var k0 = 0; k0 < samplesSet0.length; ++k0) {
        it('read for patient-0 ' + k0, readIt(samplesSet0, k0));
    }

    for (var k1 = 0; k1 < samplesSet0.length; ++k1) {
        it('read for patient-1 ' + k1, readIt(samplesSet1, k1));
    }

    it('update values', function () {
        samplesSet0[0].recordedDate = '2002-01-01';
        samplesSet1[0].recordedDate = '2003-05-05';
    });

    var updateIt = function (samplesSet, index) {
        return function (done) {
            var sample = samplesSet[index];
            var id = sample.id;

            api.put('/fhir/AllergyIntolerance/' + id)
                .send(sample)
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

    var notReadIt = function (samplesSet, index) {
        return function (done) {
            var sample = samplesSet[index];
            var id = sample.id;

            api.get('/fhir/AllergyIntolerance/' + id)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var resource = res.body;
                        delete resource.patient.display;
                        expect(resource).to.not.deep.equal(sample);
                        done();
                    }
                });
        };
    };

    it('detect updated not equal db for patient-0', notReadIt(samplesSet0, 0));
    it('update for patient-0', updateIt(samplesSet0, 0));
    it('read for patient-0', readIt(samplesSet0, 0));
    it('detect updated not equal db for patient-1', notReadIt(samplesSet1, 0));
    it('update for patient-1', updateIt(samplesSet1, 0));
    it('read for patient-1', readIt(samplesSet1, 0));

    var deleteIt = function (samplesSet, index) {
        return function (done) {
            var sample = samplesSet[index];
            var id = sample.id;

            api.delete('/fhir/AllergyIntolerance/' + id)
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

    var n0 = samplesSet0.length - 1;
    var n1 = samplesSet1.length - 1;

    it('delete last for patient-0', deleteIt(samplesSet0, n0));
    it('delete last for patient-1', deleteIt(samplesSet1, n1));

    it('search (no param)', searchIt(n0 + n1));

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
