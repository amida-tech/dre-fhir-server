'use strict';

var chai = require('chai');
var bbr = require('blue-button-record');

var patientHandler = require('../../lib/resource/patient');
var patientSamples = require('../samples/patient-samples')();

var expect = chai.expect;

describe('patient unit', function () {
    before('connectDatabase', function (done) {
        bbr.connectDatabase('localhost', {
            dbName: 'fhirpatientunit'
        }, function (err) {
            if (err) {
                done(err);
            } else {
                bbr.clearDatabase(done);
            }
        });
    });

    var patients = {};

    var createPatientIt = function (index) {
        var patientSample = patientSamples[index];

        return function (done) {
            patientHandler.create(bbr, patientSample, function (err, id) {
                if (err) {
                    done(err);
                } else {
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
        patientHandler.search(bbr, null, function (err, bundle) {
            if (err) {
                done(err);
            } else {
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

            patientHandler.read(bbr, id, function (err, resource) {
                if (err) {
                    done(err);
                } else {
                    expect(resource).to.deep.equal(patientSample);
                    done();
                }
            });
        };
    };

    for (var j = 0; j < n; ++j) {
        it('read ' + i, readIt(j));
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
    });

    var updateIt = function (index) {
        return function (done) {
            var patientSample = patientSamples[index];

            patientHandler.update(bbr, patientSample, function (err) {
                if (err) {
                    done(err);
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

    it('clearDatabase', function (done) {
        bbr.clearDatabase(function (err) {
            done(err);
        });
    });

    after(function (done) {
        bbr.disconnect(function (err) {
            done(err);
        });
    });
});