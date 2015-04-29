'use strict';

var modelsCommon = require('./models-common');

exports.create = function (bbr, resource, callback) {
    modelsCommon.create(bbr, 'vitals', resource, callback);
};

exports.search = function (bbr, params, callback) {
    modelsCommon.search(bbr, 'vitals', params, callback);
};

exports.read = function (bbr, id, callback) {
    modelsCommon.read(bbr, 'vitals', id, callback);
};

exports.update = function (bbr, resource, callback) {
    modelsCommon.update(bbr, 'vitals', resource, callback);
};

exports.delete = function (bbr, id, callback) {
    modelsCommon.delete(bbr, 'vitals', id, callback);
};
