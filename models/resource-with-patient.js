'use strict';

var _ = require('lodash');

var bbGenFhir = require('blue-button-gen-fhir');

var modelsCommon = require('./models-common');
var modelsUtil = require('./models-util');
var bundleUtil = require('../lib/bundle-util');
var errUtil = require('../lib/error-util');

var methods = {};

module.exports = exports = function (options) {
    var result = modelsCommon(options);
    result.sectionInfo = options.searchSections || result.sectionName;
    _.assign(result, methods);
    return result;
};

methods.paramsTransform = function (bbr, patientRefKey, params, paramToBBRParamMap, callback) {
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
                    callback(null, modelsUtil.paramsToBBRParams(params, paramToBBRParamMap));
                }
            });
        } else {
            callback(null, modelsUtil.paramsToBBRParams(params, paramToBBRParamMap));
        }
    } else {
        callback(null, {});
    }
};

methods.searchWithSpec = function (bbr, searchSpec, referenceKeys, callback) {
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

methods.search = function (bbr, params, callback) {
    var sectionInfo = this.sectionInfo;
    var referenceKeys = this.referenceKeys;
    var settings = this.searchSettings;
    if (params && params.searchId) {
        var searchSpec = {
            searchId: params.searchId.value,
            page: params.page.value
        };
        this.searchWithSpec(bbr, searchSpec, referenceKeys, callback);
    } else {
        var self = this;
        this.paramsTransform(bbr, referenceKeys.patientKey, params, settings.paramToBBRParamMap, function (err, bbrParams) {
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
                    mustLink: settings.mustLink,
                    resource: settings.resource
                };
                self.searchWithSpec(bbr, searchSpec, referenceKeys, callback);
            }
        });
    }
};
