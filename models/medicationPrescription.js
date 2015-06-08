'use strict';

var util = require('util');

var _ = require('lodash');
var bbFhir = require('blue-button-fhir');

var resource = require('./resource-with-patient');
var bundleUtil = require('../lib/bundle-util');
var errUtil = require('../lib/error-util');

module.exports = exports = resource({
    sectionName: 'medications',
    patientRefKey: 'patient',
    resource: 'medicationPrescription'
});

exports.resourceToModelEntry = function (bbr, resource, callback) {
    var bundle = bundleUtil.toDocument([resource]);
    var model = bbFhir.toModel(bundle);
    var medication = model && _.get(model, 'data.medications[0]');
    if (medication) {
        medication._resource = 'medicationPrescription';
        callback(null, medication);
    } else {
        var msg = util.format('%s resource cannot be parsed', resource.resourceType);
        callback(errUtil.error('fhirToModel', msg));
    }
};
