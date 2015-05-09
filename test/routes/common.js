'use strict';

var _ = require('lodash');

exports.generateTestItem = function (obj, fn, args) {
    return function (done) {
        if (args) {
            args = Array.isArray(args) ? args.concat([done]) : [args, done];
        } else {
            args = [done];
        }
        fn.apply(obj, args);
    };
};

exports.putPatientRefs = function (resourceSets, patients, patientProperty) {
    resourceSets.forEach(function (resources, index) {
        var reference = patients[index].id;
        resources.forEach(function (resource) {
            resource[patientProperty] = {
                reference: reference
            };
        });
    });
};

exports.putPanelElementRefs = function (resourceSets) {
    resourceSets.forEach(function (resources) {
        _.range(resources.panelStart, resources.length).forEach(function (index) {
            var resource = resources[index];
            resource.related.forEach(function (related) {
                var relatedIndex = related.target.reference;
                related.target.reference = resources[relatedIndex].id;
            });
        });
    });
};
