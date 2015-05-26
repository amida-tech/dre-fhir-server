'use strict';

var chai = require('chai');
var _ = require('lodash');
var sinon = require('sinon');
var moment = require('moment');
var bbr = require('blue-button-record');
var bbgen = require('blue-button-gen-fhir');

var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();

var expect = chai.expect;

var methods = {};

module.exports = function (options) {
    var result = Object.create(methods);
    options = options || {};
    result.patientRefKey = options.patientRefKey;
    result.manualId = '023456789012345678901234';
    result.pageSize = options.pageSize;
    return result;
};

methods.incrementManualId = function () {
    var n = this.manualId.length;
    var lastFour = this.manualId.substring(n - 4, n);
    lastFour = (parseInt(lastFour) + 1).toString();
    this.manualId = this.manualId.substring(0, n - 4) + lastFour;
    return this.manualId;
};

methods.connectDatabase = function (dbName) {
    var self = this;
    return function (done) {
        var options = {
            dbName: dbName,
            fhir: true,
            maxSearch: self.pageSize
        };
        if (this.pageSize) {
            options.maxSearch = this.pageSize;
        }
        bbr.connectDatabase('localhost', options, function (err) {
            if (err) {
                done(err);
            } else {
                bbr.clearDatabase(done);
            }
        });
    };
};

methods.detectMissingPatient = function (model, sample) {
    return function (done) {
        model.create(bbr, sample, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('createPatientMissing');
            done();
        });
    };
};

methods.createDbError = function (model, sample, method) {
    return function (done) {
        var stub = sinon.stub(bbr, method, function () {
            arguments[arguments.length - 1](new Error(method));
        });

        model.create(bbr, sample, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('internalDbError');
            expect(err.message).to.equal(method);
            stub.restore();
            done();
        });
    };
};

methods.createBadResource = function (model) {
    return function (done) {
        var junk = {
            junk: 'junk'
        };
        model.create(bbr, junk, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('fhirToModel');
            done();
        });
    };
};

methods.createBadPatientId = function (model, sample, badId) {
    var self = this;
    return function (done) {
        var sampleClone = _.cloneDeep(sample);
        sampleClone[self.patientRefKey].reference = badId;
        model.create(bbr, sampleClone, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('createPatientMissing');
            done();
        });
    };
};

methods.create = function (model, sample, list, map, moments) {
    return function (done) {
        model.create(bbr, sample, function (err, createInfo) {
            if (err) {
                done(err);
            } else {
                var momentStart = moments.start;
                expect(createInfo).to.exist;
                expect(createInfo.versionId).to.equal('1');
                var momentMeta = moment(createInfo.lastUpdated);
                expect(momentMeta.isValid()).to.equal(true);
                var momentNow = moment();
                expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
                sample.id = createInfo.id;
                map[sample.id] = sample;
                list.push(sample.id);
                done();
            }
        });
    };
};

methods.assignPatient = function (sampleSet, patientSample) {
    var patientRefKey = this.patientRefKey;
    var reference = patientSample.id;
    sampleSet.forEach(function (sample) {
        sample[patientRefKey] = {
            reference: reference
        };
    });
};

methods.search = function (model, params, map, count) {
    var self = this;
    var patientRefKey = this.patientRefKey;
    return function (done) {
        model.search(bbr, params, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                expect(bundle.type).to.equal('searchset');
                expect(bundle.entry).to.have.length(count);
                for (var j = 0; j < count; ++j) {
                    var dbResource = bundle.entry[j].resource;
                    if (patientRefKey) {
                        delete dbResource[patientRefKey].display;
                    }
                    expect(dbResource).to.deep.equal(map[dbResource.id]);
                }
                expect(bundle.link).not.to.exist;
                done();
            }
        });
    };
};

methods.searchPagedFirst = function (model, params, map, count, searchKey) {
    var pageSize = this.pageSize;
    var self = this;
    var patientRefKey = this.patientRefKey;
    return function (done) {
        model.search(bbr, params, function (err, bundle, searchInfo) {
            if (err) {
                done(err);
            } else {
                expect(bundle.type).to.equal('searchset');
                expect(bundle.total).to.equal(count);
                expect(bundle.entry).to.have.length(pageSize);
                for (var j = 0; j < pageSize; ++j) {
                    var dbResource = bundle.entry[j].resource;
                    if (patientRefKey) {
                        delete dbResource[patientRefKey].display;
                    }
                    expect(dbResource).to.deep.equal(map[dbResource.id]);
                }
                expect(searchInfo.pageSize).to.equal(pageSize);
                expect(searchInfo.searchId).to.exist;
                expect(searchInfo.page).to.equal(0);
                self.search[searchKey] = searchInfo.searchId;
                done();
            }
        });
    };
};

methods.searchIdPage = function (model, list, map, fullCount, searchKey, pageNo) {
    var pageSize = this.pageSize;
    var self = this;
    var patientRefKey = this.patientRefKey;
    return function (done) {
        var params = {
            searchId: {
                value: self.search[searchKey],
            },
            page: {
                value: pageNo
            }
        };
        var listClone = _.clone(list);
        listClone.reverse();
        model.search(bbr, params, function (err, bundle, searchInfo) {
            if (err) {
                done(err);
            } else {
                expect(bundle.type).to.equal('searchset');
                expect(bundle.total).to.equal(searchInfo.total);
                expect(bundle.total).to.equal(fullCount);
                var count = pageSize;
                if (bundle.total < (pageNo + 1) * pageSize) {
                    count = bundle.total % pageSize;
                }
                expect(bundle.entry).to.have.length(count);
                var offset = pageNo * pageSize;
                for (var j = 0; j < count; ++j) {
                    var dbResource = bundle.entry[j].resource;
                    if (patientRefKey) {
                        delete dbResource[patientRefKey].display;
                    }
                    expect(dbResource).to.deep.equal(map[dbResource.id]);
                    expect(dbResource.id).to.equal(listClone[offset + j]);
                }
                expect(searchInfo.pageSize).to.equal(pageSize);
                expect(searchInfo.searchId).to.equal(self.search[searchKey]);
                expect(searchInfo.page).to.equal(pageNo);
                done();
            }
        });
    };
};

methods.searchDbError = function (model, params, method, stubFn) {
    var patientRefKey = this.patientRefKey;
    return function (done) {
        if (!stubFn) {
            stubFn = function () {
                arguments[arguments.length - 1](new Error(method));
            };
        }
        var stub = sinon.stub(bbr, method, stubFn);
        model.search(bbr, params, function (err, bundle) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('internalDbError');
            expect(err.message).to.equal(method);
            stub.restore();
            done();
        });
    };
};

methods.searchById = function (model, sample, map, count) {
    var self = this;
    return function (done) {
        var id = sample ? sample.id : '123456789012345678901234';
        var params = {
            _id: {
                value: id
            }
        };
        var fn = self.search(model, params, map, count);
        fn(done);
    };
};

methods.searchByPatient = function (model, sample, map, count) {
    var patientRefKey = this.patientRefKey;
    var self = this;
    return function (done) {
        var params = {};
        params[patientRefKey] = {
            value: sample.id,
            type: 'reference'
        };
        var fn = self.search(model, params, map, count);
        fn(done);
    };
};

methods.searchByPatientDbError = function (model, sample, method, stubFn) {
    var patientRefKey = this.patientRefKey;
    var self = this;
    return function (done) {
        var params = {};
        params[patientRefKey] = {
            value: sample.id,
            type: 'reference'
        };
        var fn = self.searchDbError(model, params, method, stubFn);
        fn(done);
    };
};

methods.searchByMissingPatient = function (model, id, map) {
    var patientRefKey = this.patientRefKey;
    var self = this;
    return function (done) {
        var params = {};
        params[patientRefKey] = {
            value: id,
            type: 'reference'
        };
        var fn = self.search(model, params, map, 0);
        fn(done);
    };
};

methods.read = function (model, sample, moments, versionId, expectedRemoved) {
    var patientRefKey = this.patientRefKey;
    return function (done) {
        var momentStart = moments.start;
        var id = sample.id;
        model.read(bbr, id, function (err, resource, removed) {
            if (err) {
                done(err);
            } else {
                var meta = resource.meta;
                expect(meta).to.exist;
                expect(meta.versionId).to.exist;
                expect(meta.lastUpdated).to.exist;
                delete resource.meta;
                if (patientRefKey) {
                    delete resource[patientRefKey].display;
                }
                expect(resource).to.deep.equal(sample);
                expect(versionId).to.equal(meta.versionId);
                var momentMeta = moment(meta.lastUpdated);
                expect(momentMeta.isValid()).to.equal(true);
                var momentNow = moment();
                expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
                expect(!!removed).to.be.equal(!!expectedRemoved);
                done();
            }
        });
    };
};

methods.readMissing = function (model, id) {
    return function (done) {
        model.read(bbr, id, function (err, resource) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('readMissing');
            done();
        });
    };
};

methods.readDbError = function (model, sample, method, stubFn) {
    return function (done) {
        if (!stubFn) {
            stubFn = function () {
                arguments[arguments.length - 1](new Error(method));
            };
        }
        var stub = sinon.stub(bbr, method, stubFn);

        var id = sample.id;
        model.read(bbr, id, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('internalDbError');
            expect(err.message).to.equal(method);
            stub.restore();
            done();
        });
    };
};

methods.readGenFhirError = function (model, sample) {
    return function (done) {
        var stubFn = function () {
            return null;
        };
        var stub = sinon.stub(bbgen, 'entryToResource', stubFn);

        var id = sample.id;
        model.read(bbr, id, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('internalDbError');
            stub.restore();
            done();
        });
    };
};

methods.readNegative = function (model, sample) {
    var patientRefKey = this.patientRefKey;
    return function (done) {
        var id = sample.id;
        model.read(bbr, id, function (err, resource) {
            if (err) {
                done(err);
            } else {
                delete resource.meta;
                if (patientRefKey) {
                    delete resource[patientRefKey].display;
                }
                expect(resource).to.not.deep.equal(sample);
                done();
            }
        });
    };
};

methods.updateInvalidId = function (model, sample, badId) {
    return function (done) {
        var sampleClone = _.cloneDeep(sample);
        sampleClone.id = badId;
        model.update(bbr, sampleClone, function (err, resource) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('updateInvalidId');
            done();
        });
    };
};

methods.updateDeleted = function (model, sample) {
    return function (done) {
        model.update(bbr, sample, function (err, resource) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('updateDeleted');
            done();
        });
    };
};

methods.updateDbError = function (model, sample, method, stubFn) {
    return function (done) {
        if (!stubFn) {
            stubFn = function () {
                arguments[arguments.length - 1](new Error(method));
            };
        }
        var stub = sinon.stub(bbr, method, stubFn);

        model.update(bbr, sample, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('internalDbError');
            expect(err.message).to.equal(method);
            stub.restore();
            done();
        });
    };
};

methods.update = function (model, sample, moments, versionId) {
    return function (done) {
        model.update(bbr, sample, function (err, updateInfo) {
            if (err) {
                done(err);
            } else {
                var momentStart = moments.start;
                expect(updateInfo).to.exist;
                expect(updateInfo.isCreated).to.equal(false);
                expect(updateInfo.versionId).to.equal(versionId);
                var momentMeta = moment(updateInfo.lastUpdated);
                expect(momentMeta.isValid()).to.equal(true);
                var momentNow = moment();
                expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
                done();
            }
        });
    };
};

methods.updateToCreate = function (model, sample, list, map, moments) {
    var self = this;
    return function (done) {
        var id = self.incrementManualId();
        sample.id = id;
        model.update(bbr, sample, function (err, updateInfo) {
            if (err) {
                done(err);
            } else {
                var momentStart = moments.start;
                expect(updateInfo).to.exist;
                expect(updateInfo.isCreated).to.equal(true);
                expect(updateInfo.versionId).to.equal('1');
                var momentMeta = moment(updateInfo.lastUpdated);
                expect(momentMeta.isValid()).to.equal(true);
                var momentNow = moment();
                expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
                expect(updateInfo.id.toString()).to.equal(id);
                map[sample.id] = sample;
                list.push(sample.id);
                done();
            }
        });
    };
};

methods.detectMissingPatientForUpdate = function (model, sample) {
    var self = this;
    return function (done) {
        var sampleClone = _.cloneDeep(sample);
        var id = self.manualId;
        sampleClone.id = id;
        model.update(bbr, sampleClone, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('createPatientMissing');
            done();
        });
    };
};

methods.updateBadResource = function (model, sample) {
    return function (done) {
        var junk = {
            id: sample.id.toString(),
            junk: 'junk'
        };
        model.update(bbr, junk, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('fhirToModel');
            done();
        });
    };
};

methods.delete = function (model, sample) {
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

methods.deleteMissing = function (model, id) {
    return function (done) {
        model.delete(bbr, id, function (err, resource) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('deleteMissing');
            done();
        });
    };
};

methods.deleteDbError = function (model, sample, method, stubFn) {
    return function (done) {
        if (!stubFn) {
            stubFn = function () {
                arguments[arguments.length - 1](new Error(method));
            };
        }
        var stub = sinon.stub(bbr, method, stubFn);
        var id = sample.id;
        model.delete(bbr, id, function (err) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('internalDbError');
            expect(err.message).to.equal(method);
            stub.restore();
            done();
        });
    };
};

methods.clearDatabase = function (done) {
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
