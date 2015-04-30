'use strict';

var modelsCommon = require('./models-common');

var library = modelsCommon({
    sectionName: 'problems',
    patientRefKey: 'subject'
});

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
