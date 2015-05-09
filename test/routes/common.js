'use strict';

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
