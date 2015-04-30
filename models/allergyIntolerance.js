'use strict';

var modelsCommon = require('./models-common');

var library = modelsCommon({
    patientRefKey: 'patient'
});

exports.create = function (bbr, resource, callback) {
    library.create(bbr, 'allergies', resource, callback);
};

exports.search = function (bbr, params, callback) {
    library.search(bbr, 'allergies', params, callback);
};

exports.read = function (bbr, id, callback) {
    library.read(bbr, 'allergies', id, callback);
};

exports.update = function (bbr, resource, callback) {
    library.update(bbr, 'allergies', resource, callback);
};

exports.delete = function (bbr, id, callback) {
    library.delete(bbr, 'allergies', id, callback);
};
