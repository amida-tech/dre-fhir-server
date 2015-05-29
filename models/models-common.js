'use strict';

var util = require('util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');
var _ = require('lodash');

var modelsUtil = require('./models-util');
var errUtil = require('../lib/error-util');
var bundleUtil = require('../lib/bundle-util');

var bbudt = bbu.datetime;

var methods = {};

module.exports = function (options) {
    var result = Object.create(methods);
    result.sectionName = options.sectionName;
    result.patientRefKey = options.patientRefKey;
    result.searchSettings = {
        paramToBBRParamMap: {
            '_id': '_id',
            'patient': 'pat_key',
            'subject': 'pat_key'
        },
        mustLink: options.mustLink
    };
    result.referenceKeys = {
        patientKey: options.patientRefKey
    };
    return result;
};

methods.resourceToModelEntry = function (bbr, resource, callback) {
    var result = bbFhir.resourceToModelEntry(resource, this.sectionName);
    if (result) {
        callback(null, result);
    } else {
        var msg = util.format('%s resource cannot be parsed', resource.resourceType);
        callback(errUtil.error('fhirToModel', msg));
    }
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
    var self = this;
    this.resourceToModelEntry(bbr, resource, function (err, entry) {
        if (err) {
            callback(err);
        } else {
            if (resource.related) {
                entry._components = resource.related.map(function (related) {
                    return related.target.reference;
                });
            }
            if (id) {
                entry._id = id;
            }

            modelsUtil.findPatientKey(bbr, resource, self.patientRefKey, function (err, ptKey) {
                if (err) {
                    callback(err);
                } else {
                    self.saveNewResource(bbr, ptKey, resource, entry, callback);
                }
            });
        }
    });
};

methods.create = function (bbr, resource, callback) {
    this.createShared(bbr, resource, null, callback);
};

methods.search = function (bbr, params, callback) {
    modelsUtil.searchResourceWithPatient(bbr, params, this.sectionName, this.referenceKeys, this.searchSettings, callback);
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
                        if (result._link) {
                            _.set(resource, 'prescription.reference', result._link.toString());
                        }
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
    var self = this;
    var sectionName = this.sectionName;
    this.resourceToModelEntry(bbr, resource, function (err, entry) {
        if (err) {
            callback(err);
        } else {
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
