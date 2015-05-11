'use strict';

var bundleUtil = require('../lib/bundle-util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var modelsUtil = require('./models-util');
var bbu = require('blue-button-util');

var bbudt = bbu.datetime;
var paramsToBBRParams = modelsUtil.paramsToBBRParams;

var findPatientKey = function findPatientKey(bbr, candidate, index, callback) {
    var currPtKey = candidate + (index === 0 ? index : '');
    bbr.patientKeyToId('demographics', currPtKey, function (err, id) {
        if (err) {
            callback(err);
        } else if (!id) {
            callback(null, currPtKey);
        } else {
            ++index;
            findPatientKey(bbr, candidate, index, callback);
        }
    });
};

exports.create = function (bbr, resource, callback) {
    var bundle = bundleUtil.toBundle(resource);
    var model = bbFhir.toModel(bundle);
    var demographics = model.data.demographics;
    var name = demographics.name;
    var ptKeyCandidate = name.first.charAt(0).toLowerCase() + name.last.toLowerCase();

    findPatientKey(bbr, ptKeyCandidate, 0, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            modelsUtil.saveResourceAsSource(bbr, ptKey, resource, function (err, id) {
                if (err) {
                    callback(err);
                } else {
                    bbr.saveSection('demographics', ptKey, demographics, id, function (err, id) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, id.toString());
                        }
                    });
                }
            });
        }
    });
};

var paramToBBRParamMap = {
    'family': 'data.name.last',
    'birthDate': 'data.dob.point.date',
    '_id': '_id'
};

exports.search = function (bbr, params, callback) {
    var bbrParams = params ? paramsToBBRParams(params, paramToBBRParamMap) : {};
    bbr.getMultiSection('demographics', bbrParams, false, function (err, results) {
        if (err) {
            callback(err);
        } else {
            var bundleEntry = results.map(function (result) {
                var bundle = bbGenFhir.demographicsToFHIR(result);
                var resource = bundle.entry[0];
                resource.resource.id = result._id.toString();
                return resource;
            });
            var fhirResults = {
                resourceType: 'Bundle',
                total: bundleEntry.length,
                entry: bundleEntry
            };
            callback(null, fhirResults);
        }
    });
};

exports.read = function (bbr, id, callback) {
    bbr.getEntry('demographics', null, id, function (err, result) {
        if (err) {
            callback(err);
        } else {
            var bundle = bbGenFhir.demographicsToFHIR(result);
            var resource = bundle.entry[0].resource;
            resource.id = id;
            callback(null, resource);
        }
    });
};

exports.update = function (bbr, resource, callback) {
    var bundle = bundleUtil.toBundle(resource);
    var model = bbFhir.toModel(bundle);
    var demographics = model.data.demographics;
    bbr.idToPatientKey('demographics', resource.id, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            modelsUtil.saveResourceAsSource(bbr, ptKey, resource, function (err, sourceId) {
                if (err) {
                    callback(err);
                } else {
                    bbr.replaceEntry('demographics', ptKey, resource.id, sourceId, demographics, function (err, id) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                }
            });
        }
    });
};

exports.delete = function (bbr, id, callback) {
    bbr.idToPatientKey('demographics', id, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            bbr.removeEntry('demographics', ptKey, id, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
};
