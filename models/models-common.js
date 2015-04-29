'use strict';

var util = require('util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');
var _ = require('lodash');

var modelsUtil = require('./models-util');

var bbudt = bbu.datetime;

exports.create = function (bbr, sectionName, resource, callback) {
    var entry = bbFhir.resourceToModelEntry(resource, sectionName);
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

    modelsUtil.findPatientKey(bbr, resource, 'subject', function (err, ptKey) {
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

var paramsToBBRParams = (function () {
    var map = {
        '_id': '_id',
        'patient': 'pat_key'
    };

    var prefixMap = {
        '<': '$lt',
        '>': '$gt',
        '>=': '$gte',
        '<=': '$lte'
    };

    return function (params) {
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

var paramsTransform = function (bbr, params, callback) {
    if (params) {
        params = _.cloneDeep(params);
        if (params.patient) {
            bbr.idToPatientInfo('demographics', params.patient.value, function (err, patientInfo) {
                if (err) {
                    callback(err);
                } else {
                    params.patient.value = patientInfo.key;
                    callback(null, paramsToBBRParams(params));
                }
            });
        } else {
            callback(null, paramsToBBRParams(params));
        }
    } else {
        callback(null, {});
    }
};

exports.search = function (bbr, sectionName, params, callback) {
    paramsTransform(bbr, params, function (err, bbrParams) {
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
                        resource.subject = result._pt;
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
                        if (resource.extension) {
                            delete resource.extension;
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

exports.read = function (bbr, sectionName, id, callback) {
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
                    resource.subject = {
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
                    if (resource.extension) {
                        delete resource.extension;
                    }
                    callback(null, resource);
                }
            });
        }
    });
};

exports.update = function (bbr, sectionName, resource, callback) {
    var entry = bbFhir.resourceToModelEntry(resource, sectionName);
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

exports.delete = function (bbr, sectionName, id, callback) {
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
