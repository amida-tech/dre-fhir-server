'use strict';

var _ = require('lodash');

var patients = [{
    "resourceType": "Patient",
    "identifier": [{
        "system": "urn:oid:2.16.840.1.113883.3.441.1.50.300011.51",
        "value": "26789"
    }],
    "name": [{
        "family": [
            "ClinicalSummary"
        ],
        "given": [
            "Another"
        ]
    }],
    "gender": "male",
    "birthDate": "1964-06-12",
    "address": [{
        "line": [
            "123 Anytime Test Road"
        ],
        "city": "Wheeling",
        "state": "IL",
        "postalCode": "60090",
        "country": "US"
    }],
    "maritalStatus": {
        "coding": [{
            "system": "http://hl7.org/fhir/v3/MaritalStatus",
            "code": "D",
            "display": "Divorced"
        }],
        "text": "Divorced"
    },
    "communication": [{
        "language": {
            "coding": [{
                "code": "ewe",
                "system": "urn:ietf:params:language"
            }]
        }
    }],
    "extension": [{
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2028-9",
                "display": "Asian"
            }]
        }
    }, {
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2186-5",
                "display": "Not Hispanic or Latino"
            }]
        }
    }]
}, {
    "resourceType": "Patient",
    "identifier": [{
        "system": "http://www.midea-tecg.com",
        "value": "JOE_DOE_IDENTIFIER"
    }],
    "name": [{
        "family": [
            "DOE"
        ],
        "given": [
            "JOE"
        ]
    }],
    "birthDate": "1980-12-13"
}, {
    "resourceType": "Patient",
    "identifier": [{
        "system": "urn:oid:1.3.6.1.4.1.22812.11.0.100610",
        "value": "101646"
    }],
    "name": [{
        "family": [
            "Everyman"
        ],
        "given": [
            "Adam"
        ]
    }],
    "gender": "male",
    "birthDate": "1962-10-22",
    "communication": [{
        "language": {
            "coding": [{
                "code": "eng",
                "system": "urn:ietf:params:language"
            }]
        },
        "preferred": true
    }],
    "extension": [{
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2106-3",
                "display": "White"
            }]
        }
    }, {
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2186-5",
                "display": "Not Hispanic or Latino"
            }]
        }
    }]
}, {
    "resourceType": "Patient",
    "identifier": [{
        "system": "urn:oid:2.16.840.1.113883.19.5.99999.2",
        "value": "123"
    }],
    "name": [{
        "family": [
            "Wayne"
        ],
        "given": [
            "John"
        ]
    }],
    "gender": "male",
    "birthDate": "1965-01-15"
}, {
    "resourceType": "Patient",
    "identifier": [{
        "system": "urn:oid:2.16.840.1.113883.19",
        "value": "12345"
    }, {
        "system": "urn:oid:2.16.840.1.113883.4.1",
        "value": "111-00-1234"
    }],
    "name": [{
        "family": [
            "Everyman"
        ],
        "given": [
            "Adam",
            "Frankie"
        ],
        "prefix": [
            "Mr."
        ]
    }],
    "telecom": [{
        "system": "phone",
        "value": "(781)555-1212",
        "use": "home"
    }],
    "gender": "male",
    "birthDate": "1954-11-25",
    "address": [{
        "use": "home",
        "line": [
            "17 Daws Rd."
        ],
        "city": "Blue Bell",
        "state": "MA",
        "postalCode": "02368",
        "country": "US"
    }],
    "maritalStatus": {
        "coding": [{
            "system": "http://hl7.org/fhir/v3/MaritalStatus",
            "code": "M",
            "display": "Married"
        }],
        "text": "Married"
    },
    "communication": [{
        "language": {
            "coding": [{
                "code": "fr-CN",
                "system": "urn:ietf:params:language"
            }]
        },
        "preferred": true
    }],
    "extension": [{
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-religion",
        "valueCodeableConcept": {
            "coding": [{
                "system": "http://hl7.org/fhir/v3/vs/ReligiousAffiliation",
                "code": "1013",
                "display": "Christian (non-Catholic, non-specific)"
            }]
        }
    }, {
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2106-3",
                "display": "White"
            }]
        }
    }, {
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2186-5",
                "display": "Not Hispanic or Latino"
            }]
        }
    }]
}, {
    "resourceType": "Patient",
    "identifier": [{
        "system": "urn:oid:2.16.840.1.113883.19.5.99999.2",
        "value": "998991"
    }, {
        "system": "urn:oid:2.16.840.1.113883.4.1",
        "value": "111-00-2330"
    }],
    "name": [{
        "family": [
            "Jones"
        ],
        "given": [
            "Isabella",
            "Isa"
        ]
    }],
    "telecom": [{
        "system": "phone",
        "value": "(816)276-6909",
        "use": "home"
    }],
    "gender": "female",
    "birthDate": "1975-05-01",
    "address": [{
        "use": "home",
        "line": [
            "1357 Amber Drive"
        ],
        "city": "Beaverton",
        "state": "OR",
        "postalCode": "97867",
        "country": "US"
    }],
    "maritalStatus": {
        "coding": [{
            "system": "http://hl7.org/fhir/v3/MaritalStatus",
            "code": "M",
            "display": "Married"
        }],
        "text": "Married"
    },
    "communication": [{
        "language": {
            "coding": [{
                "code": "en",
                "system": "urn:ietf:params:language"
            }]
        },
        "preferred": true
    }],
    "extension": [{
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-religion",
        "valueCodeableConcept": {
            "coding": [{
                "system": "http://hl7.org/fhir/v3/vs/ReligiousAffiliation",
                "code": "1013",
                "display": "Christian (non-Catholic, non-specific)"
            }]
        }
    }, {
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2106-3",
                "display": "White"
            }]
        }
    }, {
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
        "valueCodeableConcept": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.6.238",
                "code": "2186-5",
                "display": "Not Hispanic or Latino"
            }]
        }
    }]
}];

module.exports = function () {
    return _.cloneDeep(patients);
};
