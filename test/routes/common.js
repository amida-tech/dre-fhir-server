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

exports.searchById = function (obj, fn, resource) {
    return function (done) {
        var args = [1, {
            _id: resource.id
        }, done];
        fn.apply(obj, args);
    };
};

exports.searchByPatient = function (obj, fn, patient, patientProperty, count) {
    return function (done) {
        var query = {};
        query[patientProperty] = patient.id;
        var args = [count, query, done];
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

exports.putPrescriptionRefs = function (resourceSets, prescriptionSets, prescriptionProperty) {
    resourceSets.forEach(function (resources, setIndex) {
        var prescriptions = prescriptionSets[setIndex];
        resources.forEach(function (resource, index) {
            var reference = prescriptions[index].id;
            _.set(resource, prescriptionProperty, reference);

        });
    });
};

exports.putResourceRelatedRefs = function (resources, index) {
    var resource = resources[index];
    if (resource.related) {
        resource.related.forEach(function (related) {
            var relatedIndex = related.target.reference;
            related.target.reference = resources[relatedIndex].id;
        });
    }
};

exports.multiplySamples = function (times, samples) {
    var n = samples.length;
    var result = _.range(times).map(function (i) {
        var offset = i * n;
        return _.range(n).map(function (j) {
            var clone = _.cloneDeep(samples[j]);
            if (offset && clone.related) {
                clone.related.forEach(function (related) {
                    var relatedIndex = related.target.reference;
                    related.target.reference = relatedIndex + offset;
                });
            }
            return clone;
        });
    });
    return _.flatten(result);
};

exports.multiplySampleSets = function (times, sampleSets) {
    return sampleSets.map(function (samples) {
        return exports.multiplySamples(times, samples);
    });
};
