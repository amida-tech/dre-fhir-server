'use strict';

var util = require('util');
var bbFhir = require('blue-button-fhir');

var modelsCommon = require('./models-common');
var modelsUtil = require('./models-util');
var bundleUtil = require('../lib/bundle-util');
var errUtil = require('../lib/error-util');

module.exports = exports = modelsCommon({
    sectionName: 'medications',
    patientRefKey: 'patient'
});

exports.resourceToModelEntry = function (resource, callback) {
    var bundle = bundleUtil.toBundle(resource);
    var model = bbFhir.toModel(bundle);
    if (model && model.data && model.data.medications) {
        var medication = model.data.medications[0];
        return medication;
    }
    var msg = util.format('%s resource cannot be parsed', resource.resourceType);
    callback(errUtil.error('fhirToModel', msg));
    return null;
};
