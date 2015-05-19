'use strict';

var util = require('util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');
var _ = require('lodash');

var modelsUtil = require('./models-util');
var errUtil = require('../lib/error-util');

var bbudt = bbu.datetime;
var paramsToBBRParams = modelsUtil.paramsToBBRParams;

var methods = {};

module.exports = function (options) {
    var result = Object.create(methods);
    result.sectionName = options.sectionName;
    result.patientRefKey = options.patientRefKey;
    return result;
};

methods.resourceToModelEntry = function (resource, callback) {
    var result = bbFhir.resourceToModelEntry(resource, this.sectionName);
    if (!result) {
        var msg = util.format('%s resource cannot be parsed', resource.resourceType);
        callback(errUtil.error('fhirToModel', msg));
    }
    return result;
};

methods.saveNewResource = function (bbr, ptKey, resource, section, callback) {
    var sectionName = this.sectionName;
    modelsUtil.saveResourceAsSource(bbr, ptKey, resource, function (err, sourceId) {
        if (err) {
            callback(err);
        } else {
            bbr.saveSection(sectionName, ptKey, section, sourceId, function (err, createInfo) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else {
                    callback(null, createInfo);
                }
            });
        }
    });
};

methods.createShared = function (bbr, resource, id, callback) {
    var entry = this.resourceToModelEntry(resource, callback);
    if (!entry) {
        return;
    }
    if (resource.related) {
        entry._components = resource.related.map(function (related) {
            return related.target.reference;
        });
    }
    if (id) {
        entry._id = id;
    }

    var self = this;
    modelsUtil.findPatientKey(bbr, resource, this.patientRefKey, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            self.saveNewResource(bbr, ptKey, resource, entry, callback);
        }
    });
};

methods.create = function (bbr, resource, callback) {
    this.createShared(bbr, resource, null, callback);
};

var paramToBBRParamMap = {
    '_id': '_id',
    'patient': 'pat_key',
    'subject': 'pat_key'
};

var paramsTransform = function (bbr, patientRefKey, params, callback) {
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

methods.search = function (bbr, params, callback) {
    var sectionName = this.sectionName;
    var patientRefKey = this.patientRefKey;
    paramsTransform(bbr, patientRefKey, params, function (err, bbrParams) {
        if (err) {
            callback(err);
        } else if (!bbrParams) {
            var fhirResults = {
                resourceType: 'Bundle',
                total: 0,
                entry: []
            };
            callback(null, fhirResults);
        } else {
            bbr.getMultiSection(sectionName, bbrParams, true, function (err, results) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else {
                    var bundleEntry = results.map(function (result) {
                        var resource = bbGenFhir.entryToResource(sectionName, result);
                        resource.id = result._id.toString();
                        resource[patientRefKey] = result._pt;
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
                        return {
                            resource: resource
                        };
                    });
                    var fhirResults = {
                        resourceType: 'Bundle',
                        total: bundleEntry.length,
                        entry: bundleEntry
                    };
                    callback(null, fhirResults);
                }
            });
        }
    });
};

methods.read = function (bbr, id, callback) {
    var sectionName = this.sectionName;
    var patientRefKey = this.patientRefKey;
    bbr.idToPatientInfo(sectionName, id, function (err, patientInfo, removed) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else if (!patientInfo) {
            var missingMsg = util.format('No resource with id %s', id);
            callback(errUtil.error('readMissing', missingMsg));
        } else {
            bbr.getEntry(sectionName, patientInfo.key, id, function (err, result) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else {
                    var resource = bbGenFhir.entryToResource(sectionName, result.data);
                    if (!resource) {
                        var msg = util.format('Entry for %s cannot be converted to a resource', sectionName);
                        callback(errUtil.error('internalDbError', msg));
                    } else {
                        resource.id = id;
                        resource[patientRefKey] = {
                            reference: patientInfo.reference,
                            display: patientInfo.display
                        };
                        var metaAttr = result.metadata.attribution;
                        var versionId = metaAttr.length;
                        var lastUpdated;
                        if (removed) {
                            ++versionId;
                            lastUpdated = result.archived_on.toISOString();
                        } else {
                            lastUpdated = metaAttr[versionId - 1].merged.toISOString();
                        }
                        resource.meta = {
                            lastUpdated: lastUpdated,
                            versionId: versionId.toString()
                        };
                        if (result._components && result._components.length) {
                            resource.related = result._components.map(function (component) {
                                return {
                                    target: {
                                        reference: component.toString()
                                    },
                                    type: "has-component"
                                };
                            });
                        }
                        callback(null, resource, removed);
                    }
                }
            });
        }
    });
};

methods.update = function (bbr, resource, callback) {
    var sectionName = this.sectionName;
    var entry = this.resourceToModelEntry(resource, callback);
    if (!entry) {
        return;
    }
    var self = this;
    bbr.idToPatientKey(sectionName, resource.id, function (err, keyInfo) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else if (!keyInfo) {
            self.createShared(bbr, resource, resource.id, function (err, createInfo) {
                if (!err) {
                    createInfo.isCreated = true;
                }
                callback(err, createInfo);
            });
        } else if (keyInfo.archived) {
            var deletedMsg = util.format('Resource with id %s is deleted', resource.id);
            callback(errUtil.error('updateDeleted', deletedMsg));
        } else if (keyInfo.invalid) {
            var invalidIdMsg = util.format('Resource id is invalid %s', resource.id);
            callback(errUtil.error('updateInvalidId', invalidIdMsg));
        } else {
            modelsUtil.saveResourceAsSource(bbr, keyInfo.key, resource, function (err, sourceId) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else {
                    bbr.replaceEntry(sectionName, keyInfo.key, resource.id, sourceId, entry, function (err, updateInfo) {
                        if (err) {
                            callback(errUtil.error('internalDbError', err.message));
                        } else {
                            updateInfo.isCreated = false;
                            callback(null, updateInfo);
                        }
                    });
                }
            });
        }
    });
};

methods.delete = function (bbr, id, callback) {
    var sectionName = this.sectionName;
    bbr.idToPatientKey(sectionName, id, function (err, keyInfo) {
        if (err) {
            callback(errUtil.error('internalDbError', err.message));
        } else if (!keyInfo || keyInfo.invalid) {
            var missingMsg = util.format('No resource with id %s', id);
            callback(errUtil.error('deleteMissing', missingMsg));
        } else {
            bbr.removeEntry(sectionName, keyInfo.key, id, function (err) {
                if (err) {
                    callback(errUtil.error('internalDbError', err.message));
                } else {
                    callback(null);
                }
            });
        }
    });
};
