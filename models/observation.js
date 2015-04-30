'use strict';

var bbFhir = require('blue-button-fhir');

var modelsCommon = require('./models-common');
var bundleUtil = require('../lib/bundle-util');

var libraryVitals = modelsCommon({
    sectionName: 'vitals',
    patientRefKey: 'subject'
});

var libraryResults = modelsCommon({
    sectionName: 'results',
    patientRefKey: 'subject'
});

var findSection = function (bbr, id, callback) {
    bbr.idToPatientInfo('vitals', id, function (err, patientInfoVitals) {
        if (err || !patientInfoVitals) {
            bbr.idToPatientInfo('results', id, function (err, patientInfoResults) {
                if (err) {
                    callback(err);
                } else if (!patientInfoResults) {
                    callback(new Error('No patient is found'));
                } else {
                    callback(null, 'results');
                }
            });
        } else {
            callback(null, 'vitals');
        }
    });
};

exports.create = function (bbr, resource, callback) {
    var sectionName = bbFhir.classifyResource(resource);
    if (sectionName === 'vitals') {
        libraryVitals.create(bbr, resource, callback);
    } else {
        libraryResults.create(bbr, resource, callback);
    }
};

exports.search = function (bbr, params, callback) {
    libraryVitals.search(bbr, params, function (err, bundleVitals) {
        if (err) {
            callback(err);
        } else {
            libraryResults.search(bbr, params, function (err, bundleResults) {
                if (err) {
                    callback(err);
                } else {
                    var result = bundleUtil.mergeBundles(bundleVitals, bundleResults);
                    callback(null, result);
                }
            });
        }
    });
};

exports.read = function (bbr, id, callback) {
    findSection(bbr, id, function (err, sectionName) {
        if (err) {
            callback(err);
        } else {
            if (sectionName === 'vitals') {
                libraryVitals.read(bbr, id, callback);
            } else {
                libraryResults.read(bbr, id, callback);

            }
        }
    });
};

exports.update = function (bbr, resource, callback) {
    findSection(bbr, resource.id, function (err, sectionName) {
        if (err) {
            callback(err);
        } else {
            if (sectionName === 'vitals') {
                libraryVitals.update(bbr, resource, callback);
            } else {
                libraryResults.update(bbr, resource, callback);
            }
        }
    });
};

exports.delete = function (bbr, id, callback) {
    findSection(bbr, id, function (err, sectionName) {
        if (err) {
            callback(err);
        } else {
            if (sectionName === 'vitals') {
                libraryVitals.delete(bbr, id, callback);
            } else {
                libraryResults.delete(bbr, id, callback);
            }
        }
    });
};
