"use strict";

var _ = require('lodash');

var observations;

exports.set0 = function () {
    return _.cloneDeep(observations);
};

exports.panelStart0 = 5;

exports.set1 = function () {
    var set = _.cloneDeep(observations);
    for (var i = 0; i < 5; ++i) {
        var value = set[i].valueQuantity.value;
        set[i].valueQuantity.value = value + 20;
    }
    return set;
};

exports.panelStart1 = 5;

observations = [{
    "id": "Observation/3",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "8302-2",
            "display": "Height"
        }],
        "text": "Height"
    },
    "valueQuantity": {
        "value": 178,
        "units": "cm",
        "code": "cm",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok"
}, {
    "id": "Observation/4",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "3141-9",
            "display": "Weight"
        }],
        "text": "Weight"
    },
    "valueQuantity": {
        "value": 82,
        "units": "kg",
        "code": "kg",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok"
}, {
    "id": "Observation/5",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "8480-6",
            "display": "BP Systolic"
        }],
        "text": "BP Systolic"
    },
    "valueQuantity": {
        "value": 150,
        "units": "mm[Hg]",
        "code": "mm[Hg]",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok"
}, {
    "id": "Observation/6",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "8462-4",
            "display": "BP Diastolic"
        }],
        "text": "BP Diastolic"
    },
    "valueQuantity": {
        "value": 100,
        "units": "mm[Hg]",
        "code": "mm[Hg]",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok"
}, {
    "id": "Observation/7",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "39156-5",
            "display": "Body Mass Index Calculated"
        }],
        "text": "Body Mass Index Calculated"
    },
    "valueQuantity": {
        "value": 25.9
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok"
}, {
    "id": "Observation/8",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "55418-8",
            "display": "Weight and Height tracking panel"
        }],
        "text": "Weight and Height tracking panel"
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok",
    "related": [{
        "type": "has-component",
        "target": {
            "reference": 0
        }
    }, {
        "type": "has-component",
        "target": {
            "reference": 1
        }
    }, {
        "type": "has-component",
        "target": {
            "reference": 4
        }
    }]
}, {
    "id": "Observation/9",
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "35094-2",
            "display": "Blood pressure panel"
        }],
        "text": "Blood pressure panel"
    },
    "issued": "2014-08-06",
    "status": "final",
    "reliability": "ok",
    "related": [{
        "type": "has-component",
        "target": {
            "reference": 2
        }
    }, {
        "type": "has-component",
        "target": {
            "reference": 3
        }
    }]
}];
