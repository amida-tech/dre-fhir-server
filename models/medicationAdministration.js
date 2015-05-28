'use strict';

var util = require('util');

var _ = require('lodash');
var bbFhir = require('blue-button-fhir');

var modelsCommon = require('./models-common');
var presriptionModel = require('./medicationPrescription');
var bundleUtil = require('../lib/bundle-util');
var errUtil = require('../lib/error-util');

module.exports = exports = modelsCommon({
    sectionName: 'medications',
    patientRefKey: 'patient'
});

var getMedicationPrescription = function (bbr, resource, callback) {
    var reference = _.get(resource, 'prescription.reference');
    if (!reference) {
        callback(errUtil.error('createMedPrescriptionMissing', 'No prescription specified'));
    } else {
        //presriptionModel.read(bbr, reference, callback);
    }
};

exports.resourceToModelEntry = function (bbr, resource, callback) {
    getMedicationPrescription(bbr, resource, function (err, medicationPrescription) {
        if (err) {
            callback(err);
        } else {
            var bundle = bundleUtil.toBundle(resource);
            var model = bbFhir.toModel(bundle);
            if (model && model.data && model.data.medications) {
                var medication = model.data.medications[0];
                callback(null, medication);
            } else {
                var msg = util.format('%s resource cannot be parsed', resource.resourceType);
                callback(errUtil.error('fhirToModel', msg));
            }
        }
    });
};
