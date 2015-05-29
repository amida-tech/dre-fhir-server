'use strict';

var util = require('util');

var _ = require('lodash');
var bbu = require('blue-button-util');
var bbGenFhir = require('blue-button-gen-fhir');

var bbudt = bbu.datetime;

var errUtil = require('../lib/error-util');
var bundleUtil = require('../lib/bundle-util');

exports.saveResourceAsSource = function (connection, ptKey, resource, callback) {
    var resourceAsText = JSON.stringify(resource, undefined, 4);
    var metaData = {
        type: 'application/json+fhir',
        name: 'fhir.patient',
        size: resourceAsText.length
    };
    connection.saveSource(ptKey, resourceAsText, metaData, 'fhir', function (err, sourceId) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else {
            callback(null, sourceId);
        }
    });
};

exports.findPatientKey = function (connection, resource, patientProperty, callback) {
    var p = resource[patientProperty];
    var reference = p && p.reference;
    if (!reference) {
        callback(errUtil.error('createPatientMissing', 'No patient specified'));
    } else {
        connection.idToPatientKey('demographics', reference, function (err, keyInfo) {
            if (err) {
                callback(errUtil.error('internalDbError', err.message));
            } else {
                if (keyInfo && !keyInfo.invalid) {
                    callback(null, keyInfo.key);
                } else {
                    var missingMsg = util.format('No patient resource with id %s', reference);
                    callback(errUtil.error('createPatientMissing', missingMsg));
                }
            }
        });
    }
};

var paramsToBBRParams = exports.paramsToBBRParams = (function () {
    var prefixMap = {
        '<': '$lt',
        '>': '$gt',
        '>=': '$gte',
        '<=': '$lte'
    };

    return function (params, map) {
        var keys = Object.keys(params);
        var queryObject = {};
        keys.forEach(function (key) {
            var target = map[key];
            if (target) {
                var paramsElement = params[key];
                var value = paramsElement.value;
                if (paramsElement.type === 'date') {
                    var modelDate = bbudt.dateToModel(value);
                    value = modelDate.date;
                }
                if (paramsElement.prefix) {
                    var op = prefixMap[paramsElement.prefix];
                    var valueWithAction = {};
                    valueWithAction[op] = value;
                    queryObject[target] = valueWithAction;
                } else {
                    queryObject[target] = value;
                }
            }
        });
        return queryObject;
    };
})();

var paramsTransform = function (bbr, patientRefKey, params, paramToBBRParamMap, callback) {
    if (params) {
        params = _.cloneDeep(params);
        if (params[patientRefKey]) {
            bbr.idToPatientKey('demographics', params[patientRefKey].value, function (err, keyInfo) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else if (!keyInfo || keyInfo.invalid) {
                    callback(null, null);
                } else {
                    params[patientRefKey].value = keyInfo.key;
                    callback(null, paramsToBBRParams(params, paramToBBRParamMap));
                }
            });
        } else {
            callback(null, paramsToBBRParams(params, paramToBBRParamMap));
        }
    } else {
        callback(null, {});
    }
};

var searchWithSpec = function (bbr, searchSpec, referenceKeys, callback) {
    bbr.search(searchSpec, function (err, results, searchInfo) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else {
            var bundleEntry = results.map(function (result) {
                var resource = bbGenFhir.entryToResource(result._section, result.data);
                resource.id = result._id;
                resource[referenceKeys.patientKey] = result._pt;
                if (result._components && result._components.length) {
                    resource.related = result._components.map(function (component) {
                        return {
                            target: {
                                reference: component
                            },
                            type: "has-component"
                        };
                    });
                }
                if (result._link) {
                    _.set(resource, referenceKeys.linkKey, result._link);
                }
                return {
                    resource: resource
                };
            });
            var bundle = bundleUtil.toSearchSet(bundleEntry, searchInfo);
            callback(null, bundle, searchInfo);
        }
    });

};

exports.searchResourceWithPatient = function (bbr, params, sectionInfo, referenceKeys, settings, callback) {
    if (params && params.searchId) {
        var searchSpec = {
            searchId: params.searchId.value,
            page: params.page.value
        };
        searchWithSpec(bbr, searchSpec, referenceKeys, callback);
    } else {
        paramsTransform(bbr, referenceKeys.patientKey, params, settings.paramToBBRParamMap, function (err, bbrParams) {
            if (err) {
                callback(err);
            } else if (!bbrParams) {
                var bundle = bundleUtil.toSearchSet([]);
                callback(null, bundle);
            } else {
                var searchSpec = {
                    section: sectionInfo,
                    query: bbrParams,
                    patientInfo: true,
                    mustLink: settings.mustLink
                };
                searchWithSpec(bbr, searchSpec, referenceKeys, callback);
            }
        });
    }
};
