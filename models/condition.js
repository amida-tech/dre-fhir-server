'use strict';

var modelsCommon = require('./models-common');

var library = modelsCommon();

exports.create = function (bbr, resource, callback) {
    library.create(bbr, 'problems', resource, callback);
};

exports.search = function (bbr, params, callback) {
    library.search(bbr, 'problems', params, callback);
};

exports.read = function (bbr, id, callback) {
    library.read(bbr, 'problems', id, callback);
};

exports.update = function (bbr, resource, callback) {
    library.update(bbr, 'problems', resource, callback);
};

exports.delete = function (bbr, id, callback) {
    library.delete(bbr, 'problems', id, callback);
};
