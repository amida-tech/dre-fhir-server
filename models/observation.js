'use strict';

var modelsCommon = require('./models-common');

var library = modelsCommon();

exports.create = function (bbr, resource, callback) {
    library.create(bbr, 'vitals', resource, callback);
};

exports.search = function (bbr, params, callback) {
    library.search(bbr, 'vitals', params, callback);
};

exports.read = function (bbr, id, callback) {
    library.read(bbr, 'vitals', id, callback);
};

exports.update = function (bbr, resource, callback) {
    library.update(bbr, 'vitals', resource, callback);
};

exports.delete = function (bbr, id, callback) {
    library.delete(bbr, 'vitals', id, callback);
};
