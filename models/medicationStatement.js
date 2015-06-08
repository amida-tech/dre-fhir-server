'use strict';

var util = require('util');

var _ = require('lodash');
var bbf = require('blue-button-fhir');

var modelsCommon = require('./models-common');
var bundleUtil = require('../lib/bundle-util');
var errUtil = require('../lib/error-util');

module.exports = exports = modelsCommon({
    sectionName: 'medications',
    patientRefKey: 'patient'
});

exports.resourceToModelEntry = function (bbr, resource, callback) {
    var bundle = bundleUtil.toDocument([resource]);
    var model = bbf.toModel(bundle);
    var medication = model && _.get(model, 'data.medications[0]');
    if (medication) {
        callback(null, medication);
    } else {
        var msg = util.format('%s resource cannot be parsed', resource.resourceType);
        callback(errUtil.error('fhirToModel', msg));
    }
};
