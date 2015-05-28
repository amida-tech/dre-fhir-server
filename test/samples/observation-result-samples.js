"use strict";

var _ = require('lodash');

var observations;

exports.set0 = function () {
    return _.cloneDeep(observations);
};

exports.set1 = function () {
    var set = _.cloneDeep(observations);
    for (var i = 0; i < 5; ++i) {
        if (set[i].valueQuantity) {
            var value = set[i].valueQuantity.value;
            set[i].valueQuantity.value = value + 20;
        }
    }
    return set;
};

observations = [{
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "20570-8",
            "display": "Hematocrit, Whole Blood"
        }],
        "text": "Hematocrit, Whole Blood"
    },
    "valueQuantity": {
        "value": 44,
        "units": "%",
        "code": "%",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2013-05-13",
    "status": "final",
    "reliability": "ok",
    "referenceRange": [{
        "meaning": {
            "coding": [{
                "system": "http://hl7.org/fhir/referencerange-meaning",
                "code": "normal",
                "display": "Normal Range"
            }],
            "text": "Normal Range"
        },
        "text": "41 - 53 %"
    }]
}, {
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "15218-1",
            "display": "Food Allerg Mix2 IgE Ql"
        }],
        "text": "Food Allerg Mix2 IgE Ql"
    },
    "valueString": "negative",
    "issued": "2012-08-10",
    "status": "final",
    "reliability": "ok",
    "interpretation": {
        "coding": [{
            "system": "http://hl7.org/fhir/v2/0078",
            "code": "N",
            "display": "Normal"
        }],
        "text": "Normal"
    }
}, {
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "30313-1",
            "display": "HGB"
        }],
        "text": "HGB"
    },
    "valueQuantity": {
        "value": 10.2,
        "units": "g/dl",
        "code": "g/dl",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2012-08-10",
    "status": "final",
    "reliability": "ok",
    "interpretation": {
        "coding": [{
            "system": "http://hl7.org/fhir/v2/0078",
            "code": "N",
            "display": "Normal"
        }],
        "text": "Normal"
    },
    "referenceRange": [{
        "meaning": {
            "coding": [{
                "system": "http://hl7.org/fhir/referencerange-meaning",
                "code": "normal",
                "display": "Normal Range"
            }],
            "text": "Normal Range"
        },
        "text": "M 13-18 g/dl; F 12-16 g/dl"
    }]
}, {
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "33765-9",
            "display": "WBC"
        }],
        "text": "WBC"
    },
    "valueQuantity": {
        "value": 12.3,
        "units": "10+3/ul",
        "code": "10+3/ul",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2012-08-10",
    "status": "final",
    "reliability": "ok",
    "interpretation": {
        "coding": [{
            "system": "http://hl7.org/fhir/v2/0078",
            "code": "N",
            "display": "Normal"
        }],
        "text": "Normal"
    },
    "referenceRange": [{
        "meaning": {
            "coding": [{
                "system": "http://hl7.org/fhir/referencerange-meaning",
                "code": "normal",
                "display": "Normal Range"
            }],
            "text": "Normal Range"
        },
        "low": {
            "value": 4.3,
            "units": "10+3/ul",
            "code": "10+3/ul",
            "system": "http://unitsofmeasure.org"
        },
        "high": {
            "value": 10.8,
            "units": "10+3/ul",
            "code": "10+3/ul",
            "system": "http://unitsofmeasure.org"
        }
    }]
}, {
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://loinc.org",
            "code": "26515-7",
            "display": "PLT"
        }],
        "text": "PLT"
    },
    "valueQuantity": {
        "value": 123,
        "units": "10+3/ul",
        "code": "10+3/ul",
        "system": "http://unitsofmeasure.org"
    },
    "issued": "2012-08-10",
    "status": "final",
    "reliability": "ok",
    "interpretation": {
        "coding": [{
            "system": "http://hl7.org/fhir/v2/0078",
            "code": "L",
            "display": "Low"
        }],
        "text": "Low"
    },
    "referenceRange": [{
        "meaning": {
            "coding": [{
                "system": "http://hl7.org/fhir/referencerange-meaning",
                "code": "normal",
                "display": "Normal Range"
            }],
            "text": "Normal Range"
        },
        "low": {
            "value": 150,
            "units": "10+3/ul",
            "code": "10+3/ul",
            "system": "http://unitsofmeasure.org"
        },
        "high": {
            "value": 350,
            "units": "10+3/ul",
            "code": "10+3/ul",
            "system": "http://unitsofmeasure.org"
        }
    }]
}, {
    "resourceType": "Observation",
    "code": {
        "coding": [{
            "system": "http://snomed.info/sct",
            "code": "43789009",
            "display": "CBC WO DIFFERENTIAL"
        }],
        "text": "CBC WO DIFFERENTIAL"
    },
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
    }, {
        "type": "has-component",
        "target": {
            "reference": 4
        }
    }]
}];
