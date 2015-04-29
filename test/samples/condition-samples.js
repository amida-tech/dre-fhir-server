"use strict";

var _ = require('lodash');

var conditions;

exports.set0 = function () {
    var result = _.cloneDeep(conditions);
    return result.slice(0, 3);
};

exports.set1 = function () {
    var result = _.cloneDeep(conditions);
    return result.slice(3, 6);
};

conditions = [{
    "resourceType": "Condition",
    "status": "confirmed",
    "onsetDateTime": "2012-08-05",
    "dateAsserted": "2012-08-05",
    "abatementBoolean": true,
    "code": {
        "coding": [{
            "code": "233604007",
            "system": "http://snomed.info/sct",
            "display": "Pneumonia"
        }],
        "text": "Pneumonia"
    }
}, {
    "resourceType": "Condition",
    "status": "confirmed",
    "onsetDateTime": "2012-08-15",
    "dateAsserted": "2012-08-15",
    "code": {
        "coding": [{
            "system": "http://snomed.info/sct",
            "code": "64109004",
            "display": "Costochondritis"
        }],
        "text": "Costochondritis"
    }
}, {
    "resourceType": "Condition",
    "status": "confirmed",
    "onsetDateTime": "2011-09-25",
    "dateAsserted": "2011-09-25",
    "code": {
        "coding": [{
            "system": "http://snomed.info/sct",
            "code": "195967001",
            "display": "Asthma"
        }],
        "text": "Asthma"
    }
}, {
    "resourceType": "Condition",
    "status": "confirmed",
    "onsetDateTime": "2010-01-10",
    "dateAsserted": "2010-01-10",
    "code": {
        "coding": [{
            "system": "http://snomed.info/sct",
            "code": "363746003",
            "display": "Hypertension"
        }],
        "text": "Hypertension"
    }
}, {
    "resourceType": "Condition",
    "status": "confirmed",
    "onsetDateTime": "2013-01-30",
    "dateAsserted": "2013-01-30",
    "code": {
        "coding": [{
            "system": "http://snomed.info/sct",
            "code": "48440001",
            "display": "Gout"
        }],
        "text": "Gout"
    }
}, {
    "resourceType": "Condition",
    "status": "confirmed",
    "onsetDateTime": "2011-03-10",
    "dateAsserted": "2011-03-10",
    "code": {
        "coding": [{
            "system": "http://snomed.info/sct",
            "code": "195967001",
            "display": "Type II DIabetes"
        }],
        "text": "Type II DIabetes"
    }
}];
