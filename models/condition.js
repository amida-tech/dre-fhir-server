'use strict';

var modelsCommon = require('./models-common');

exports.create = function (bbr, resource, callback) {
    modelsCommon.create(bbr, 'problems', resource, callback);
};

exports.search = function (bbr, params, callback) {
    modelsCommon.search(bbr, 'problems', params, callback);
};

exports.read = function (bbr, id, callback) {
    modelsCommon.read(bbr, 'problems', id, callback);
};

exports.update = function (bbr, resource, callback) {
    modelsCommon.update(bbr, 'problems', resource, callback);
};

exports.delete = function (bbr, id, callback) {
    modelsCommon.delete(bbr, 'problems', id, callback);
};
