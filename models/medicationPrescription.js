'use strict';

var util = require('util');
var bbFhir = require('blue-button-fhir');

var modelsCommon = require('./models-common');
var modelsUtil = require('./models-util');
var bundleUtil = require('../lib/bundle-util');
var errUtil = require('../lib/error-util');

var library = modelsCommon({
    sectionName: 'medications',
    patientRefKey: 'patient'
});

library.resourceToModelEntry = function (resource, callback) {
    var bundle = bundleUtil.toBundle(resource);
    var model = bbFhir.toModel(bundle);
    if (model && model.data && model.data.medications) {
        var medication = model.data.medications[0];
        if (medication) {
            return medication;
        }
    }
    var msg = util.format('%s resource cannot be parsed', resource.resourceType);
    callback(errUtil.error('fhirToModel', msg));
    return null;
};

exports.create = function (bbr, resource, callback) {
    library.create(bbr, resource, callback);
};

exports.search = function (bbr, params, callback) {
    library.search(bbr, params, callback);
};

exports.read = function (bbr, id, callback) {
    library.read(bbr, id, callback);
};

exports.update = function (bbr, resource, callback) {
    library.update(bbr, resource, callback);
};

exports.delete = function (bbr, id, callback) {
    library.delete(bbr, id, callback);
};
