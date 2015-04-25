'use strict';

var request = require('supertest');
var chai = require('chai');
var _ = require('lodash');

var expect = chai.expect;
var fhirApp = require('../../config/app');
var patientSamples = require('../samples/patient-samples')();

describe('patient routes', function () {
    var app;
    var server;
    var api;

    before(function (done) {
        app = fhirApp({
            db: {
                "dbName": "fhirpatientsearch"
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
                    expect(res.body.db.dbName).to.equal("fhirpatientsearch");
                    done();
                }
            });
    });

    it('clear database', function (done) {
        var c = app.get('connection');
        c.clearDatabase(done);
    });

    var patientSamples0Clone = _.cloneDeep(patientSamples[0]);
    patientSamples0Clone.birthDate = '1978-06-09';
    patientSamples.push(patientSamples0Clone);

    var patients = {};

    var createIt = function (index) {
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

    var searchIt = function (count, query) {
        return function (done) {
            var r = api.get('/fhir/Patient');
            if (query) {
                r.query(query);
            }
            r.expect(200)
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

    var searchIdIt = function (index, count) {
        return function (done) {
            var id = index >= 0 ? patientSamples[index].id : '123456789012345678901234';
            var query = {
                _id: id
            };
            var fn = searchIt(count, query);
            fn(done);
        };
    };

    for (var i0 = 0; i0 < n; ++i0) {
        it('search with id ' + i0, searchIdIt(i0, 1));
    }
    it('search not exists id ' + i, searchIdIt(-1, 0));

    var searchFamilyIt = function (index, count) {
        var family = index >= 0 ? patientSamples[index].name[0].family[0] : 'doesnotexists';
        var query = {
            family: family
        };
        return searchIt(count, query);
    };

    it('search family and find 2', searchFamilyIt(0, 2));
    it('search family and find 1', searchFamilyIt(1, 1));
    it('search family and find 1', searchFamilyIt(-1, 0));

    var patientSamplesCopy = patientSamples.slice();
    patientSamplesCopy.sort(function (left, right) {
        var bdayLeft = left.birthDate;
        var bdayRight = right.birthDate;
        var result = (bdayLeft < bdayRight) ? -1 : ((bdayLeft > bdayRight) ? 1 : 0);
        return result;
    });

    var borderIndex = Math.floor(patientSamplesCopy.length / 2);
    var borderBBday = patientSamplesCopy[borderIndex].birthDate;

    var searchBirthdayIt = function (prefix, count) {
        var query = {
            birthDate: prefix + borderBBday
        };
        return searchIt(count, query);
    };

    var npsc = patientSamplesCopy.length;

    it('search birthDate and find ' + borderIndex, searchBirthdayIt('<', borderIndex));
    it('search birthDate and find ' + (borderIndex + 1), searchBirthdayIt('<=', borderIndex + 1));
    it('search birthDate and find ' + (npsc - borderIndex - 1), searchBirthdayIt('>', npsc - borderIndex - 1));
    it('search birthDate and find ' + (npsc - borderIndex), searchBirthdayIt('>=', (npsc - borderIndex)));

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
