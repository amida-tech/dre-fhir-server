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

    var readIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];
            var id = obsSample.id;

            obsModel.read(bbr, id, function (err, resource) {
                if (err) {
                    done(err);
                } else {
                    delete resource.subject.display;
                    expect(resource).to.deep.equal(obsSample);
                    done();
                }
            });
        };
    };

    for (var k0 = 0; k0 < obsSamples.panelStart0; ++k0) {
        it('read observation patient 0 ' + k0, readIt(obsSamplesSet0, k0));
    }

    for (var k1 = 0; k1 < obsSamples.panelStart1; ++k1) {
        it('read observation patient 1 ' + k1, readIt(obsSamplesSet1, k1));
    }

    var updateIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];

            obsModel.update(bbr, obsSample, function (err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        };
    };

    var notReadIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];
            var id = obsSample.id;

            obsModel.read(bbr, id, function (err, resource) {
                if (err) {
                    done(err);
                } else {
                    delete resource.subject.display;
                    expect(resource).to.not.deep.equal(obsSample);
                    done();
                }
            });
        };
    };

    it('update values', function () {
        obsSamplesSet0[0].valueQuantity.value += 1;
        obsSamplesSet1[0].valueQuantity.value += 1;
    });

    it('read not equal pat 0 0', notReadIt(obsSamplesSet0, 0));
    it('update pat 0 0', updateIt(obsSamplesSet0, 0));
    it('read pat 0 0', readIt(obsSamplesSet0, 0));
    it('read not equal pat 1 0', notReadIt(obsSamplesSet1, 0));
    it('update pat 1 0', updateIt(obsSamplesSet1, 0));
    it('read pat 1 0', readIt(obsSamplesSet1, 0));

    var deleteIt = function (obsSamplesSet, index) {
        return function (done) {
            var obsSample = obsSamplesSet[index];

            obsModel.delete(bbr, obsSample.id, function (err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        };
    };

    var n0 = obsSamples.panelStart0 - 1;
    var n1 = obsSamples.panelStart1 - 1;

    it('delete pat 0 ' + n0, deleteIt(obsSamplesSet0, n0));
    it('delete pat 1 ' + n1, deleteIt(obsSamplesSet1, n1));

    it('search (no param)', searchIt(n0 + n1));

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
