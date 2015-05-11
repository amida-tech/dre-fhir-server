'use strict';

var util = require('util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');
var _ = require('lodash');

var modelsUtil = require('./models-util');

var bbudt = bbu.datetime;
var paramsToBBRParams = modelsUtil.paramsToBBRParams;

var methods = {};

module.exports = function (options) {
    var result = Object.create(methods);
    result.sectionName = options.sectionName;
    result.patientRefKey = options.patientRefKey || 'subject';
    return result;
};

methods.resourceToModelEntry = function (resource) {
    return bbFhir.resourceToModelEntry(resource, this.sectionName);
};

methods.create = function (bbr, resource, callback) {
    var sectionName = this.sectionName;
    var entry = this.resourceToModelEntry(resource);
    if (!entry) {
        var msg = util.format('%s resource appears to be invalid', resource.resourceType);
        callback(new Error(msg));
        return;
    }
    if (resource.related) {
        entry._components = resource.related.map(function (related) {
            return related.target.reference;
        });
    }

    var section = [entry];

    modelsUtil.findPatientKey(bbr, resource, this.patientRefKey, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            modelsUtil.saveResourceAsSource(bbr, ptKey, resource, function (err, sourceId) {
                if (err) {
                    callback(err);
                } else {
                    bbr.saveSection(sectionName, ptKey, section, sourceId, function (err, id) {
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
    '_id': '_id',
    'patient': 'pat_key',
    'subject': 'pat_key'
};

var paramsTransform = function (bbr, patientRefKey, params, callback) {
    if (params) {
        params = _.cloneDeep(params);
        if (params[patientRefKey]) {
            bbr.idToPatientInfo('demographics', params[patientRefKey].value, function (err, patientInfo) {
                if (err) {
                    callback(err);
                } else {
                    params[patientRefKey].value = patientInfo.key;
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
        } else {
            bbr.getMultiSection(sectionName, bbrParams, true, function (err, results) {
                if (err) {
                    callback(err);
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
    bbr.idToPatientInfo(sectionName, id, function (err, patientInfo) {
        if (err) {
            callback(err);
        } else {
            bbr.getEntry(sectionName, patientInfo.key, id, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    var resource = bbGenFhir.entryToResource(sectionName, result);
                    resource.id = result._id.toString();
                    resource[patientRefKey] = {
                        reference: patientInfo.reference,
                        display: patientInfo.display
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
                    callback(null, resource);
                }
            });
        }
    });
};

methods.update = function (bbr, resource, callback) {
    var sectionName = this.sectionName;
    var entry = this.resourceToModelEntry(resource);
    if (!entry) {
        var msg = util.format('%s resource appears to be invalid', resource.resourceType);
        callback(new Error(msg));
        return;
    }
    bbr.idToPatientInfo(sectionName, resource.id, function (err, patientInfo) {
        if (err) {
            callback(err);
        } else {
            modelsUtil.saveResourceAsSource(bbr, patientInfo.key, resource, function (err, sourceId) {
                if (err) {
                    callback(err);
                } else {
                    bbr.replaceEntry(sectionName, patientInfo.key, resource.id, sourceId, entry, function (err, id) {
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

methods.delete = function (bbr, id, callback) {
    var sectionName = this.sectionName;
    bbr.idToPatientKey(sectionName, id, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            bbr.removeEntry(sectionName, ptKey, id, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
};
