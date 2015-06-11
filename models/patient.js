'use strict';

var util = require('util');

var bundleUtil = require('../lib/bundle-util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');

var modelsUtil = require('./models-util');
var modelsCommon = require('./models-common');
var errUtil = require('../lib/error-util');
var bbrOptions = {
    fhir: true
};

module.exports = exports = modelsCommon({
    sectionName: 'demographics'
});

var bbudt = bbu.datetime;
var paramsToBBRParams = modelsUtil.paramsToBBRParams;

var findPatientKey = function findPatientKey(bbr, candidate, index, callback) {
    var currPtKey = candidate + (index === 0 ? '' : index);
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

exports.createShared = function (bbr, resource, id, callback) {
    exports.resourceToModelEntry(bbr, resource, function (err, demographics) {
        if (err) {
            callback(err);
        } else {
            var name = demographics.name;
            var ptKeyCandidate = name.first.charAt(0).toLowerCase() + name.last.toLowerCase();

            findPatientKey(bbr, ptKeyCandidate, 0, function (err, ptKey) {
                if (err) {
                    callback(err);
                } else {
                    if (id) {
                        demographics._id = id;
                    }
                    exports.saveNewResource(bbr, ptKey, resource, demographics, callback);
                }
            });
        }
    });
};

exports.create = function (bbr, resource, callback) {
    this.createShared(bbr, resource, null, callback);
};

var paramToBBRParamMap = {
    'family': 'data.name.last',
    'birthDate': 'data.dob.point.date',
    '_id': '_id'
};

var searchWithSpec = function (bbr, searchSpec, callback) {
    bbr.search(searchSpec, function (err, results, searchInfo) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else {
            var bundleEntry = results.map(function (result) {
                var bundle = bbGenFhir.demographicsToFHIR(result.data);
                var resource = bundle.entry[0];
                resource.resource.id = result._id;

                var metaAttr = result.metadata.attribution;
                var versionId = metaAttr.length;
                var lastUpdated = metaAttr[versionId - 1].merged.toISOString();
                resource.resource.meta = {
                    lastUpdated: lastUpdated,
                    versionId: versionId.toString()
                };
                return resource;
            });
            var bundle = bundleUtil.toSearchSet(bundleEntry, searchInfo);
            callback(null, bundle, searchInfo);
        }
    });
};

exports.search = function (bbr, params, callback) {
    if (params && params.searchId) {
        var searchSpecWId = {
            searchId: params.searchId.value,
            page: params.page.value
        };
        searchWithSpec(bbr, searchSpecWId, callback);
    } else {
        var bbrParams = params ? paramsToBBRParams(params, paramToBBRParamMap) : {};
        var searchSpec = {
            section: 'demographics',
            query: bbrParams,
            patientInfo: false
        };
        searchWithSpec(bbr, searchSpec, callback);
    }
};

exports.read = function (bbr, id, callback) {
    bbr.idToPatientKey('demographics', id, function (err, keyInfo) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else if (!keyInfo || keyInfo.invalid) {
            var missingMsg = util.format('No resource with id %s', id);
            callback(errUtil.error('readMissing', missingMsg));
        } else {
            bbr.getEntry('demographics', keyInfo.key, id, bbrOptions, function (err, result) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else {
                    var resource = bbGenFhir.entryToResource('demographics', result.data);
                    if (!resource) {
                        var msg = util.format('Entry for %s cannot be converted to a resource', 'demographics');
                        callback(errUtil.error('internalDbError', msg));
                    } else {
                        resource.id = id;
                        var metaAttr = result.metadata.attribution;
                        var versionId = metaAttr.length;
                        var lastUpdated;
                        if (keyInfo.archived) {
                            ++versionId;
                            lastUpdated = result.archived_on.toISOString();
                        } else {
                            var prevVersion = versionId-1;
                            if( prevVersion >= 0 && (metaAttr && (prevVersion < metaAttr.length) ) )
                            lastUpdated = metaAttr[prevVersion].merged.toISOString();
                        }
                        resource.meta = {
                            lastUpdated: lastUpdated,
                            versionId: versionId.toString()
                        };
                        callback(null, resource, keyInfo.archived);
                    }
                }
            });
        }
    });
};
