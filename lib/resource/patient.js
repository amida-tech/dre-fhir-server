'use strict';

var fhirUtil = require('../fhir-util');
var bbFhir = require('blue-button-fhir');
var bbGenFhir = require('blue-button-gen-fhir');

exports.create = function (bbr, resource, callback) {
    var bundle = fhirUtil.toBundle(resource);
    var model = bbFhir.toModel(bundle);
    var demographics = model.data.demographics;
    var name = demographics.name;
    var ptKey = name.first.charAt(0).toLowerCase() + name.last.toLowerCase();
    var metaData = {
        type: 'application/json+fhir',
        name: 'fhir.patient'
    };
    bbr.saveSource(ptKey, JSON.stringify(resource, undefined, 4), metaData, 'fhir', function (err, id) {
        if (err) {
            callback(err);
        } else {
            bbr.saveSection('demographics', ptKey, demographics, id, function (err, id) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, id.toString());
                }
            });
        }
    });
};

exports.search = function (bbr, params, callback) {
    bbr.getMultiSection('demographics', function (err, results) {
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
    var bundle = fhirUtil.toBundle(resource);
    var model = bbFhir.toModel(bundle);
    var demographics = model.data.demographics;
    var metaData = {
        type: 'application/json+fhir',
        name: 'fhir.patient'
    };
    bbr.idToPatientKey('demographics', resource.id, function (err, ptKey) {
        if (err) {
            callback(err);
        } else {
            bbr.saveSource(ptKey, JSON.stringify(resource, undefined, 4), metaData, 'fhir', function (err, sourceId) {
                if (err) {
                    callback(err);
                } else {
                    bbr.replaceEntry('demographics', ptKey, resource.id, sourceId, demographics, function (err, id) {
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
