'use strict';

var request = require('supertest');
var chai = require('chai');

var expect = chai.expect;
var fhirApp = require('../../config/app');
var obsSamples = require('../samples/observation-vital-samples');
var patientSamples = require('../samples/patient-samples')();

describe('observation routes', function () {
    var app;
    var server;
    var api;

    before(function (done) {
        app = fhirApp({
            db: {
                "dbName": "fhirobservationvitalapi"
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
                    expect(res.body.db.dbName).to.equal("fhirobservationvitalapi");
                    done();
                }
            });
    });

    it('clear database', function (done) {
        var c = app.get('connection');
        c.clearDatabase(done);
    });

    var obsSamplesSet0 = obsSamples.set0();
    var obsSamplesSet1 = obsSamples.set1();

    it('create wout patient', function (done) {
        var obsSample = obsSamplesSet0[0];

        api.post('/fhir/Observation')
            .send(obsSample)
            .expect(400)
            .end(done);
    });

    var createPatientIt = function (index) {
        var patientSample = patientSamples[index];

        return function (done) {
            api.post('/fhir/Patient')
                .send(patientSample)
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
                        expect(p).to.deep.equal(['', 'fhir', 'Patient', '', '_history', '1']);
                        patientSample.id = id;
                        done();
                    }
                });
        };
    };

    for (var i = 0; i < 2; ++i) {
        it('create ' + i, createPatientIt(i));
    }

    it('assign patient 0 to samples', function () {
        [obsSamplesSet0, obsSamplesSet1].forEach(function (obsSamplesSet, index) {
            var reference = patientSamples[index].id;
            obsSamplesSet.forEach(function (obsSample) {
                obsSample.subject = {
                    reference: reference
                };
            });
        });
    });

    var vitals = {};
    var vitalIds = [];

    var createIt = function (obsSamplesSet, index) {
        var obsSample = obsSamplesSet[index];

        return function (done) {
            api.post('/fhir/Observation')
                .send(obsSample)
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
                        expect(p).to.deep.equal(['', 'fhir', 'Observation', '', '_history', '1']);
                        obsSample.id = id;
                        vitals[id] = obsSample;
                        vitalIds.push(id);
                        done();
                    }
                });
        };
    };

    var populatePanelIt = function (obsSamplesSet, index, offset) {
        return function () {
            var obsSample = obsSamplesSet[index];
            obsSample.related.forEach(function (related) {
                var index = related.target.reference;
                related.target.reference = vitalIds[index + offset];
            });
        };
    };

    for (var j0 = 0; j0 < obsSamples.panelStart0; ++j0) {
        it('create observation patient 0 ' + j0, createIt(obsSamplesSet0, j0));
    }

    for (var jj0 = obsSamples.panelStart0; jj0 < obsSamplesSet0.length; ++jj0) {
        it('populate panel patient 0 ' + jj0, populatePanelIt(obsSamplesSet0, jj0, 0));
        it('create observation patient 0 ' + jj0, createIt(obsSamplesSet0, jj0));
    }

    for (var j1 = 0; j1 < obsSamples.panelStart1; ++j1) {
        it('create observation patient 1 ' + j1, createIt(obsSamplesSet1, j1));
    }

    for (var jj1 = obsSamples.panelStart1; jj1 < obsSamplesSet1.length; ++jj1) {
        it('populate panel patient 1 ' + jj1, populatePanelIt(obsSamplesSet1, jj1, obsSamplesSet0.length));
        it('create observation patient 1 ' + jj1, createIt(obsSamplesSet1, jj1));
    }

    var searchIt = function (count, isPost) {
        return function (done) {
            var request = isPost ? api.post('/fhir/Observation/_search') : api.get('/fhir/Observation');
            request.expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var bundle = res.body;
                        expect(bundle.entry).to.have.length(count);
                        for (var j = 0; j < count; ++j) {
                            var dbVital = bundle.entry[j].resource;
                            delete dbVital.subject.display;
                            expect(dbVital).to.deep.equal(vitals[dbVital.id]);
                        }
                        done();
                    }
                });
        };
    };

    var n = obsSamplesSet0.length + obsSamplesSet1.length;
    it('search (get - no param)', searchIt(n, false));
    it('search (post - no param)', searchIt(n, true));

    var readIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];
            var id = obsSample.id;

            api.get('/fhir/Observation/' + id)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var resource = res.body;
                        delete resource.subject.display;
                        expect(resource).to.deep.equal(obsSample);
                        done();
                    }
                });
        };
    };

    for (var k0 = 0; k0 < obsSamplesSet0.length; ++k0) {
        it('read observation patient 0 ' + k0, readIt(obsSamplesSet0, k0));
    }

    for (var k1 = 0; k1 < obsSamplesSet0.length; ++k1) {
        it('read observation patient 1 ' + k1, readIt(obsSamplesSet1, k1));
    }

    it('update values', function () {
        obsSamplesSet0[0].valueQuantity.value += 1;
        obsSamplesSet1[0].valueQuantity.value += 1;
    });

    var updateIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];
            var id = obsSample.id;

            api.put('/fhir/Observation/' + id)
                .send(obsSample)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        done();
                    }
                }, 'afsin');
        };
    };

    var notReadIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];
            var id = obsSample.id;

            api.get('/fhir/Observation/' + id)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        var resource = res.body;
                        delete resource.subject.display;
                        expect(resource).to.not.deep.equal(obsSample);
                        done();
                    }
                });
        };
    };

    it('read not equal pat 0 0', notReadIt(obsSamplesSet0, 0));
    it('update pat 0 0', updateIt(obsSamplesSet0, 0));
    it('read pat 0 0', readIt(obsSamplesSet0, 0));
    it('read not equal pat 1 0', notReadIt(obsSamplesSet1, 0));
    it('update pat 1 0', updateIt(obsSamplesSet1, 0));
    it('read pat 1 0', readIt(obsSamplesSet1, 0));


    var deleteIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];
            var id = obsSample.id;

            api.delete('/fhir/Observation/' + id)
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

    var n0 = obsSamplesSet0.length - 1;
    var n1 = obsSamplesSet1.length - 1;

    it('delete pat 0 ' + n0, deleteIt(obsSamplesSet0, n0));
    it('delete pat 1 ' + n1, deleteIt(obsSamplesSet1, n1));

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
