'use strict';

var chai = require('chai');
var bbr = require('blue-button-record');

var obsModel = require('../../models/observation');
var obsSamples = require('../samples/observation-vital-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();

var expect = chai.expect;

exports.connectDatabase = function (dbName) {
    return function (done) {
        bbr.connectDatabase('localhost', {
            dbName: dbName,
            bundle_sections: ['vitals']
        }, function (err) {
            if (err) {
                done(err);
            } else {
                bbr.clearDatabase(done);
            }
        });
    };
};

exports.detectMissingPatient = function (model, sample) {
    return function (done) {
        model.create(bbr, sample, function (err) {
            if (err) {
                done();
            } else {
                done(new Error('Missing patient not detected.'));
            }
        });
    };
};

exports.create = function (model, sample, list, map) {
    return function (done) {
        model.create(bbr, sample, function (err, id) {
            if (err) {
                done(err);
            } else {
                sample.id = id;
                map[id] = sample;
                list.push(id);
                done();
            }
        });
    };
};

exports.assignPatient = function (sampleSet, patientSample) {
    var reference = patientSample.id;
    sampleSet.forEach(function (sample) {
        sample.subject = {
            reference: reference
        };
    });
};

exports.search = function (model, map, count) {
    return function (done) {
        model.search(bbr, null, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                expect(bundle.entry).to.have.length(count);
                for (var j = 0; j < count; ++j) {
                    var dbResource = bundle.entry[j].resource;
                    delete dbResource.subject.display;
                    expect(dbResource).to.deep.equal(map[dbResource.id]);
                }
                done();
            }
        });
    };
};

exports.read = function (model, sample) {
    return function (done) {
        var id = sample.id;
        model.read(bbr, id, function (err, resource) {
            if (err) {
                done(err);
            } else {
                delete resource.subject.display;
                expect(resource).to.deep.equal(sample);
                done();
            }
        });
    };
};

exports.readNegative = function (model, sample) {
    return function (done) {
        var id = sample.id;
        model.read(bbr, id, function (err, resource) {
            if (err) {
                done(err);
            } else {
                delete resource.subject.display;
                expect(resource).to.not.deep.equal(sample);
                done();
            }
        });
    };
};

exports.update = function (model, sample) {
    return function (done) {
        model.update(bbr, sample, function (err) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    };
};

exports.delete = function (model, sample) {
    return function (done) {
        model.delete(bbr, sample.id, function (err) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    };
};

exports.clearDatabase = function (done) {
    bbr.clearDatabase(function (err) {
        if (err) {
            done(err);
        } else {
            bbr.disconnect(function (err) {
                done(err);
            });
        }
    });
};
