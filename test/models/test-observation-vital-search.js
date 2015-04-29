'use strict';

var chai = require('chai');
var bbr = require('blue-button-record');

var obsModel = require('../../models/observation');
var obsSamples = require('../samples/observation-vital-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();

var shared = require('./shared');

var expect = chai.expect;

describe('models observation vital search', function () {
    before('connectDatabase', shared.connectDatabase('fhirobservationvitalsearchmodel'));

    var obsSamplesSet0 = obsSamples.set0();
    var obsSamplesSet1 = obsSamples.set1();

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

    var searchIt = function (count, params) {
        return function (done) {
            obsModel.search(bbr, params, function (err, bundle) {
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

    it('search (no param)', searchIt(obsSamplesSet0.length + obsSamplesSet1.length, {}));

    var searchIdIt = function (obsSamplesSet, index, count) {
        return function (done) {
            var id = index >= 0 ? obsSamplesSet[index].id : '123456789012345678901234';
            var params = {
                _id: {
                    value: id
                }
            };
            var fn = searchIt(count, params);
            fn(done);
        };
    };

    for (var k0 = 0; k0 < obsSamplesSet0.length; ++k0) {
        it('search with id ' + k0, searchIdIt(obsSamplesSet0, k0, 1));
    }
    it('search not exists id ' + i, searchIdIt(obsSamplesSet0, -1, 0));
    for (var k1 = 0; k1 < obsSamplesSet1.length; ++k1) {
        it('search with id ' + k1, searchIdIt(obsSamplesSet0, k1, 1));
    }
    it('search not exists id ' + i, searchIdIt(obsSamplesSet1, -1, 0));

    var searchPatientIt = function (index, count) {
        return function (done) {
            var params = {
                patient: {
                    value: patientSamples[0].id,
                    type: 'reference'
                }
            };
            var fn = searchIt(count, params);
            fn(done);
        };
    };

    it('search with patient ' + 0, searchPatientIt(obsSamplesSet0, k0, 5));

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
