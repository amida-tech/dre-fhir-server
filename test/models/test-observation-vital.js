'use strict';

var chai = require('chai');
var bbr = require('blue-button-record');

var obsModel = require('../../models/observation');
var obsSamples = require('../samples/observation-vital-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();

var expect = chai.expect;

describe('models observation vital', function () {
    before('connectDatabase', function (done) {
        bbr.connectDatabase('localhost', {
            dbName: 'fhirobservationvitalmodel',
            bundle_sections: ['vitals']
        }, function (err) {
            if (err) {
                done(err);
            } else {
                bbr.clearDatabase(done);
            }
        });
    });

    var obsSamplesSet0 = obsSamples.set0();
    var obsSamplesSet1 = obsSamples.set1();

    it('create wout patient', function (done) {
        var obsSample = obsSamplesSet0[0];
        obsModel.create(bbr, obsSample, function (err) {
            if (err) {
                done();
            } else {
                done(new Error('no patient is not detected'));
            }
        });
    });

    var createPatientIt = function (index) {
        var patientSample = patientSamples[index];

        return function (done) {
            patientModel.create(bbr, patientSample, function (err, id) {
                if (err) {
                    done(err);
                } else {
                    patientSample.id = id;
                    done();
                }
            });
        };
    };

    for (var i = 0; i < 2; ++i) {
        it('create patient ' + i, createPatientIt(i));
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
            obsModel.create(bbr, obsSample, function (err, id) {
                if (err) {
                    done(err);
                } else {
                    obsSample.id = id;
                    vitals[id] = obsSample;
                    vitalIds.push(id);
                    done();
                }
            });
        };
    };

    for (var j0 = 0; j0 < obsSamples.panelStart0; ++j0) {
        it('create observation patient 0 ' + j0, createIt(obsSamplesSet0, j0));
    }

    for (var j1 = 0; j1 < obsSamples.panelStart1; ++j1) {
        it('create observation patient 1 ' + j1, createIt(obsSamplesSet1, j1));
    }

    var searchIt = function (count) {
        return function (done) {
            obsModel.search(bbr, null, function (err, bundle) {
                if (err) {
                    done(err);
                } else {
                    expect(bundle.entry).to.have.length(count);
                    for (var j = 0; j < count; ++j) {
                        var dbObs = bundle.entry[j].resource;
                        delete dbObs.subject.display;
                        expect(dbObs).to.deep.equal(vitals[dbObs.id]);
                    }
                    done();
                }
            });
        };
    };

    it('search (no param)', searchIt(obsSamples.panelStart0 + obsSamples.panelStart1));

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
