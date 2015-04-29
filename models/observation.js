'use strict';

var bundleUtil = require('../lib/bundle-util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');
var modelsUtil = require('./models-util');
var bbu = require('blue-button-util');

exports.create = function (bbr, resource, callback) {
    var vital = bbFhir.resourceToModelEntry(resource, 'vitals');
    if (!vital) {
        callback(new Error('Observation resource appears to be invalid'));
        return;
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

exports.search = function (bbr, params, callback) {
    var bbrParams = params ? {} : {};
    bbr.getMultiSection('vitals', bbrParams, true, function (err, results) {
        if (err) {
            callback(err);
        } else {
            var bundleEntry = results.map(function (result) {
                var resource = bbGenFhir.entryToResource('vitals', result);
                resource.id = result._id.toString();
                resource.subject = result._pt;
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
