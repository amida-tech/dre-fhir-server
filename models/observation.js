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
    bbr.getMultiSection('vitals', bbrParams, function (err, results) {
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
