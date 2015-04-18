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

    it('get all', function (done) {
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
