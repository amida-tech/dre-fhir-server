'use strict';

var chai = require('chai');
var _ = require('lodash');
var bbr = require('blue-button-record');

var patientHandler = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();

var expect = chai.expect;

describe('models patient search', function () {
    before('connectDatabase', function (done) {
        bbr.connectDatabase('localhost', {
            dbName: 'fhirpatientmodelsearch'
        }, function (err) {
            if (err) {
                done(err);
            } else {
                bbr.clearDatabase(done);
            }
        });
    });

    var patientSamples0Clone = _.cloneDeep(patientSamples[0]);
    patientSamples0Clone.birthDate = '1978-06-09';
    patientSamples.push(patientSamples0Clone);

    var patients = {};

    var createIt = function (index) {
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
        it('create ' + i, createIt(i));
    }

    var searchIt = function (count, params) {
        return function (done) {
            patientHandler.search(bbr, params, function (err, bundle) {
                if (err) {
                    done(err);
                } else {
                    var bdays = bundle.entry.map(function (entry) {
                        return entry.resource.birthDate;
                    });
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

    it('search (no param)', searchIt(n, {}));

    var searchIdIt = function (index, count) {
        return function (done) {
            var id = index >= 0 ? patientSamples[index].id : '123456789012345678901234';
            var params = {
                _id: {
                    value: id
                }
            };
            var fn = searchIt(count, params);
            fn(done);
        };
    };

    for (var i0 = 0; i0 < n; ++i0) {
        it('search with id ' + i0, searchIdIt(i0, 1));
    }
    it('search not exists id ' + i, searchIdIt(-1, 0));

    var searchFamilyIt = function (index, count) {
        var family = index >= 0 ? patientSamples[index].name[0].family[0] : 'doesnotexists';
        var params = {
            family: {
                value: family
            }
        };
        return searchIt(count, params);
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
        var params = {
            birthDate: {
                value: borderBBday,
                prefix: prefix,
                type: 'date'
            }
        };
        return searchIt(count, params);
    };

    var npsc = patientSamplesCopy.length;

    it('search birthDate and find ' + borderIndex, searchBirthdayIt('<', borderIndex));
    it('search birthDate and find ' + (borderIndex + 1), searchBirthdayIt('<=', borderIndex + 1));
    it('search birthDate and find ' + (npsc - borderIndex - 1), searchBirthdayIt('>', npsc - borderIndex - 1));
    it('search birthDate and find ' + (npsc - borderIndex), searchBirthdayIt('>=', (npsc - borderIndex)));

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
