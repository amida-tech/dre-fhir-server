'use strict';

var bundleUtil = require('../lib/bundle-util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');

var modelsUtil = require('./models-util');
var modelsCommon = require('./models-common');
var errUtil = require('../lib/error-util');

var library = modelsCommon({
    sectionName: 'demographics'
});

var bbudt = bbu.datetime;
var paramsToBBRParams = modelsUtil.paramsToBBRParams;

var findPatientKey = function findPatientKey(bbr, candidate, index, callback) {
    var currPtKey = candidate + (index === 0 ? index : '');
    bbr.patientKeyToId('demographics', currPtKey, function (err, id) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else if (!id) {
            callback(null, currPtKey);
        } else {
            ++index;
            findPatientKey(bbr, candidate, index, callback);
        }
    });
};

exports.create = function (bbr, resource, callback) {
    var demographics = library.resourceToModelEntry(resource, callback);
    if (!demographics) {
        return;
    }
    var name = demographics.name;
    var ptKeyCandidate = name.first.charAt(0).toLowerCase() + name.last.toLowerCase();

    findPatientKey(bbr, ptKeyCandidate, 0, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            library.saveNewResource(bbr, ptKey, resource, demographics, callback);
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
    library.update(bbr, resource, callback);
};

exports.delete = function (bbr, id, callback) {
    library.delete(bbr, id, callback);
};
