'use strict';

var bundleUtil = require('../lib/bundle-util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var modelsUtil = require('./models-util');
var bbu = require('blue-button-util');
var _ = require('lodash');

var bbudt = bbu.datetime;

exports.create = function (bbr, resource, callback) {
    var vital = bbFhir.resourceToModelEntry(resource, 'vitals');
    if (!vital) {
        callback(new Error('Observation resource appears to be invalid'));
        return;
    }
    if (resource.related) {
        vital._components = resource.related.map(function (related) {
            return related.target.reference;
        });
    }

    var vitals = [vital];

    modelsUtil.findPatientKey(bbr, resource, 'subject', function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            modelsUtil.saveResourceAsSource(bbr, ptKey, resource, function (err, sourceId) {
                if (err) {
                    callback(err);
                } else {
                    bbr.saveSection('vitals', ptKey, vitals, sourceId, function (err, id) {
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

exports.search = function (bbr, params, callback) {
    paramsTransform(bbr, params, function (err, bbrParams) {
        if (err) {
            callback(err);
        } else {
            bbr.getMultiSection('vitals', bbrParams, true, function (err, results) {
                if (err) {
                    callback(err);
                } else {
                    var bundleEntry = results.map(function (result) {
                        var resource = bbGenFhir.entryToResource('vitals', result);
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
                        delete resource.extension;
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

exports.read = function (bbr, id, callback) {
    bbr.idToPatientInfo('vitals', id, function (err, patientInfo) {
        if (err) {
            callback(err);
        } else {
            bbr.getEntry('vitals', patientInfo.key, id, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    var resource = bbGenFhir.entryToResource('vitals', result);
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
                    delete resource.extension;
                    callback(null, resource);
                }
            });
        }
    });
};

exports.update = function (bbr, resource, callback) {
    var vital = bbFhir.resourceToModelEntry(resource, 'vitals');
    if (!vital) {
        callback(new Error('Observation resource appears to be invalid'));
        return;
    }
    bbr.idToPatientInfo('vitals', resource.id, function (err, patientInfo) {
        if (err) {
            callback(err);
        } else {
            modelsUtil.saveResourceAsSource(bbr, patientInfo.key, resource, function (err, sourceId) {
                if (err) {
                    callback(err);
                } else {
                    bbr.replaceEntry('vitals', patientInfo.key, resource.id, sourceId, vital, function (err, id) {
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
    bbr.idToPatientKey('vitals', id, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            bbr.removeEntry('vitals', ptKey, id, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
};
