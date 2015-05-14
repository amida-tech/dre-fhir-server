'use strict';

var chai = require('chai');
var _ = require('lodash');
var sinon = require('sinon');
var bbr = require('blue-button-record');

var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();

var expect = chai.expect;

var methods = {};

module.exports = function (options) {
    var result = Object.create(methods);
    options = options || {};
    result.patientRefKey = options.patientRefKey;
    return result;
};

methods.connectDatabase = function (dbName) {
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

methods.detectMissingPatient = function (model, sample) {
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

methods.create = function (model, sample, list, map) {
    return function (done) {
        model.create(bbr, sample, function (err, id) {
            if (err) {
                done(err);
            } else {
                sample.id = id.toString();
                map[sample.id] = sample;
                list.push(id);
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
    var patientRefKey = this.patientRefKey;
    return function (done) {
        model.search(bbr, params, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                expect(bundle.entry).to.have.length(count);
                for (var j = 0; j < count; ++j) {
                    var dbResource = bundle.entry[j].resource;
                    if (patientRefKey) {
                        delete dbResource[patientRefKey].display;
                    }
                    expect(dbResource).to.deep.equal(map[dbResource.id]);
                }
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

methods.read = function (model, sample) {
    var patientRefKey = this.patientRefKey;
    return function (done) {
        var id = sample.id;
        model.read(bbr, id, function (err, resource) {
            if (err) {
                done(err);
            } else {
                if (patientRefKey) {
                    delete resource[patientRefKey].display;
                }
                expect(resource).to.deep.equal(sample);
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

methods.readNegative = function (model, sample) {
    var patientRefKey = this.patientRefKey;
    return function (done) {
        var id = sample.id;
        model.read(bbr, id, function (err, resource) {
            if (err) {
                done(err);
            } else {
                if (patientRefKey) {
                    delete resource[patientRefKey].display;
                }
                expect(resource).to.not.deep.equal(sample);
                done();
            }
        });
    };
};

methods.updateMissing = function (model, sample, badId) {
    return function (done) {
        var sampleClone = _.cloneDeep(sample);
        sampleClone.id = badId;
        model.update(bbr, sampleClone, function (err, resource) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.key).to.equal('updateMissing');
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

methods.update = function (model, sample) {
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
