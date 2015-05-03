'use strict';

var _ = require('lodash');

var allergyIntolerances;

exports.set0 = function () {
    var result = _.cloneDeep(allergyIntolerances);
    return result.slice(0, 3);
};

exports.set1 = function () {
    var result = _.cloneDeep(allergyIntolerances);
    return result.slice(3, 6);
};

allergyIntolerances = [{
    "resourceType": "AllergyIntolerance",
    "criticality": "medium",
    "recordedDate": "2006-05-01",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "2670",
            "display": "Codeine"
        }],
        "text": "Codeine"
    },
    "event": [{
        "severity": "minor",
        "manifestation": [{
            "coding": [{
                "code": "267036007",
                "system": "http://snomed.info/sct",
                "display": "Shortness of Breath"
            }],
            "text": "Shortness of Breath"
        }]
    }]
}, {
    "resourceType": "AllergyIntolerance",
    "recordedDate": "2013-07-01",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://fdasis.nlm.nih.gov",
            "code": "1564HD0N96",
            "display": "cat hair"
        }],
        "text": "cat hair"
    },
    "event": [{
        "manifestation": [{
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "64144002",
                "display": "Rash"
            }],
            "text": "Rash"
        }],
        "severity": "moderate"
    }]
}, {
    "resourceType": "AllergyIntolerance",
    "criticality": "medium",
    "recordedDate": "2006-05-01",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "DUMMY_CODE",
            "display": "Codeine"
        }],
        "text": "Codeine"
    },
    "event": [{
        "severity": "minor",
        "manifestation": [{
            "coding": [{
                "code": "267036007",
                "system": "http://snomed.info/sct",
                "display": "Shortness of Breath"
            }],
            "text": "Shortness of Breath"
        }]
    }]
}, {
    "resourceType": "AllergyIntolerance",
    "recordedDate": "2014-08-06",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "1191",
            "display": "Aspirin"
        }],
        "text": "Aspirin"
    },
    "event": [{
        "manifestation": [{
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "247472004",
                "display": "Hives"
            }],
            "text": "Hives"
        }]
    }]
}, {
    "resourceType": "AllergyIntolerance",
    "recordedDate": "1998-01-10",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "7982",
            "display": "Penicillin G benzathine"
        }],
        "text": "Penicillin G benzathine"
    },
    "event": [{
        "manifestation": [{
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "247472004",
                "display": "Hives"
            }],
            "text": "Hives"
        }]
    }]
}, {
    "resourceType": "AllergyIntolerance",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "215674",
            "display": "Bicillin L-A"
        }],
        "text": "Bicillin L-A"
    }
}, {
    "resourceType": "AllergyIntolerance",
    "status": "confirmed",
    "substance": {
        "coding": [{
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "1001473",
            "display": "Ecpirin"
        }],
        "text": "Ecpirin"
    }
}];
