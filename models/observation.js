'use strict';

var modelCommon = require('./model-common');

exports.create = function (bbr, resource, callback) {
    modelCommon.create(bbr, 'vitals', resource, callback);
};

exports.search = function (bbr, params, callback) {
    modelCommon.search(bbr, 'vitals', params, callback);
};

exports.read = function (bbr, id, callback) {
    modelCommon.read(bbr, 'vitals', id, callback);
};

exports.update = function (bbr, resource, callback) {
    modelCommon.update(bbr, 'vitals', resource, callback);
};

exports.delete = function (bbr, id, callback) {
    modelCommon.delete(bbr, 'vitals', id, callback);
};
