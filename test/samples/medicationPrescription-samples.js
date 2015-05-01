'use strict';

var _ = require('lodash');

var medicationPresciptions;

exports.set0 = function () {
    var result = _.cloneDeep(medicationPresciptions);
    return result.slice(0, 3);
};

exports.set1 = function () {
    var result = _.cloneDeep(medicationPresciptions);
    return result.slice(3, 6);
};

medicationPresciptions = [{
    "id": "MedicationPrescription/mp-0-0",
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2012-08-06",
    "dosageInstruction": [{
        "route": {
            "coding": [{
                "code": "C38216",
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "display": "RESPIRATORY (INHALATION)"
            }],
            "text": "RESPIRATORY (INHALATION)"
        },
        "doseQuantity": {
            "value": 0.09,
            "units": "mg/actuat",
            "code": "mg/actuat",
            "system": "http://unitsofmeasure.org"
        },
        "timingSchedule": {
            "event": [{
                "start": "2012-08-06"
            }],
            "repeat": {
                "frequency": 1,
                "duration": 12,
                "units": "h",
                "end": "2012-08-13"
            }
        },
        "asNeededCodeableConcept": {
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "56018004",
                "display": "Wheezing"
            }],
            "text": "Wheezing"
        }
    }],
    "text": {
        "status": "generated",
        "div": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    },
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "351656",
                "display": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]"
            }],
            "text": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2014-10-03T03:59:00.000Z",
    "dosageInstruction": [{
        "timingDateTime": "2014-10-03T03:59:00.000Z"
    }],
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "0-Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "0-Albuterol 0.09 MG/ACTUAT inhalant solution"
            }],
            "text": "0-Albuterol 0.09 MG/ACTUAT inhalant solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "0-Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2012-08-06",
    "dosageInstruction": [{
        "timingSchedule": {
            "event": [{
                "start": "2012-08-06"
            }],
            "repeat": {
                "when": "HS",
                "end": "2012-08-30",
                "duration": 1,
                "units": "s"
            }
        }
    }],
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "7-Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "7-Albuterol 0.09 MG/ACTUAT inhalant solution"
            }],
            "text": "7-Albuterol 0.09 MG/ACTUAT inhalant solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "7-Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}, {
    "id": "MedicationPrescription/mp-0-0",
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2012-08-06",
    "dosageInstruction": [{
        "route": {
            "coding": [{
                "code": "C38216",
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "display": "RESPIRATORY (INHALATION)"
            }],
            "text": "RESPIRATORY (INHALATION)"
        },
        "doseQuantity": {
            "value": 0.11,
            "units": "mg/actuat",
            "code": "mg/actuat",
            "system": "http://unitsofmeasure.org"
        },
        "timingSchedule": {
            "event": [{
                "start": "2012-08-06"
            }],
            "repeat": {
                "frequency": 1,
                "duration": 12,
                "units": "h",
                "end": "2012-08-13"
            }
        },
        "asNeededCodeableConcept": {
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "56018004",
                "display": "Wheezing"
            }],
            "text": "Wheezing"
        }
    }],
    "text": {
        "status": "generated",
        "div": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    },
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "351656",
                "display": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]"
            }],
            "text": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Albuterol 0.09 MG/ACTUAT Inhalant Solution [Ventolin HFA]"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2014-11-03T03:59:00.000Z",
    "dosageInstruction": [{
        "timingDateTime": "2014-11-03T03:59:00.000Z"
    }],
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "0-Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "0-Albuterol 0.09 MG/ACTUAT inhalant solution"
            }],
            "text": "0-Albuterol 0.09 MG/ACTUAT inhalant solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "0-Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2012-09-06",
    "dosageInstruction": [{
        "timingSchedule": {
            "event": [{
                "start": "2012-09-06"
            }],
            "repeat": {
                "when": "HS",
                "end": "2012-09-30",
                "duration": 1,
                "units": "s"
            }
        }
    }],
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "7-Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "7-Albuterol 0.09 MG/ACTUAT inhalant solution"
            }],
            "text": "7-Albuterol 0.09 MG/ACTUAT inhalant solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "7-Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}];
