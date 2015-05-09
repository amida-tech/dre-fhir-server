'use strict';

exports.generateTestItem = function (obj, fn, args) {
    return function (done) {
        if (args && !Array.isArray(args)) {
            args = [args];
        }
        var fnArgs = args ? args.concat([done]) : [done];
        fn.apply(obj, fnArgs);
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
