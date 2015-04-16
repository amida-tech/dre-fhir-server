'use strict';

var bbr = require('blue-button-record');

var patientHandler = require('../../lib/resource/patient');

describe('patient unit', function () {
    var patients = [{}, {}, {}, {}, {}];

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

    var createPatientIt = function (index) {
        var patient = patients[index];

        return function (done) {
            patientHandler.create(bbr, patient, function (err) {
                done(err);
            });
        };
    };

    for (var i = 0; i < patients.length; ++i) {
        it('create ' + i, createPatientIt(i));
    }

    it('get all', function (done) {
        patientHandler.search(bbr, null, function (err) {
            done(err);
        });
    });

    it('clearDatabase', function (done) {
        bbr.clearDatabase(function (err) {
            done(err);
        });
    });

    after(function (done) {
        this.timeout(2000);

        bbr.disconnect(function (err) {
            done(err);
        });
    });
});
