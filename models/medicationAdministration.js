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
    patientRefKey: 'patient',
    mustLink: 'true',
    resource: 'medicationAdministration'
});
exports.referenceKeys.linkKey = 'prescription.reference';

var getMedicationPrescription = function (bbr, resource, callback) {
    var reference = _.get(resource, 'prescription.reference', null);
    if (reference === null) {
        callback(errUtil.error('createMedPrescriptionMissing', 'No prescription specified'));
    } else {
        presriptionModel.read(bbr, reference, callback);
    }
};

exports.resourceToModelEntry = function (bbr, resource, callback) {
    getMedicationPrescription(bbr, resource, function (err, medicationPrescription) {
        if (err) {
            callback(err);
        } else {
            var bundle = bundleUtil.toDocument([medicationPrescription, resource]);
            var model = bbFhir.toModel(bundle);
            var medication = model && _.get(model, 'data.medications[0]');
            if (medication) {
                medication._link = medicationPrescription.id;
                medication._resource = 'medicationAdministration';
                callback(null, medication);
            } else {
                var msg = util.format('%s resource cannot be parsed', resource.resourceType);
                callback(errUtil.error('fhirToModel', msg));
            }
        }
    });
};
