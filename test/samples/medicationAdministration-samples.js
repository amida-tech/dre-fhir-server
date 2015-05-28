'use strict';

var _ = require('lodash');

var medicationAdministrations;
var linkedMedicationPresciptions;

exports.set0 = function () {
    var result = _.cloneDeep(medicationAdministrations);
    return result.slice(0, 3);
};

exports.set1 = function () {
    var result = _.cloneDeep(medicationAdministrations);
    return result.slice(3, 6);
};

exports.linkedSet0 = function () {
    var result = _.cloneDeep(linkedMedicationPresciptions);
    return result.slice(0, 3);
};

exports.linkedSet1 = function () {
    var result = _.cloneDeep(linkedMedicationPresciptions);
    return result.slice(3, 6);
};

medicationAdministrations = [{
    "resourceType": "MedicationAdministration",
    "status": "completed",
    "practitioner": {
        "reference": "Practitioner/unknown",
        "display": "Unknown"
    },
    "whenGiven": {
        "start": "2012-08-06",
        "end": "2012-08-13"
    },
    "dosage": [{
        "route": {
            "coding": [{
                "code": "C38216",
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "display": "RESPIRATORY (INHALATION)"
            }],
            "text": "RESPIRATORY (INHALATION)"
        },
        "quantity": {
            "value": 0.09,
            "units": "mg/actuat",
            "code": "mg/actuat",
            "system": "http://unitsofmeasure.org"
        },
        "timingPeriod": {
            "start": "2012-08-06",
            "end": "2012-08-13"
        },
        "asNeededCodeableConcept": {
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "56018004",
                "display": "Wheezing"
            }]
        }
    }],
    "prescription": {
        "reference": 0,
        "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    },
    "medication": {
        "reference": "#med",
        "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    },
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
            }]
        }
    }]
}, {
    "resourceType": "MedicationAdministration",
    "status": "completed",
    "whenGiven": {
        "start": "2013-01-01",
        "end": "2013-01-31"
    },
    "dosage": [{
        "quantity": {
            "value": 1,
            "units": "tablet",
            "code": "tablet",
            "system": "http://unitsofmeasure.org"
        },
        "timingPeriod": {
            "start": "2013-01-01",
            "end": "2013-01-31"
        }
    }],
    "prescription": {
        "reference": 1,
        "display": "take 1 tablet (25 mg) by oral route once daily for 30 days"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "metoprolol tartrate Oral Tablet 25 mg",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "866924",
                "display": "Metoprolol Tartrate 25 MG Oral Tablet"
            }],
            "text": "Metoprolol Tartrate 25 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "metoprolol tartrate Oral Tablet 25 mg"
    }
}, {
    "resourceType": "MedicationAdministration",
    "status": "completed",
    "whenGiven": {
        "start": "2013-01-01",
        "end": "2013-01-31"
    },
    "dosage": [{
        "quantity": {
            "value": 2
        },
        "timingPeriod": {
            "start": "2013-01-01",
            "end": "2013-01-31"
        }
    }],
    "prescription": {
        "reference": 2,
        "display": "inhale 2 puffs by inhalation route every 4 hours as needed for 30 days"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Proventil HFA Inhalation HFA Aerosol Inhaler 90 mcg/actuation",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "745679",
                "display": "200 ACTUAT Albuterol 0.09 MG/ACTUAT Metered Dose Inhaler"
            }],
            "text": "200 ACTUAT Albuterol 0.09 MG/ACTUAT Metered Dose Inhaler"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Proventil HFA Inhalation HFA Aerosol Inhaler 90 mcg/actuation"
    }
}, {
    "resourceType": "MedicationAdministration",
    "status": "completed",
    "whenGiven": {
        "start": "2010-06-05"
    },
    "dosage": [{
        "timingPeriod": {
            "start": "2010-06-05"
        }
    }],
    "prescription": {
        "reference": 3
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Antihypertensive combinations + Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "858828",
                "display": "Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet"
            }],
            "text": "Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Antihypertensive combinations + Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet"
    }
}, {
    "resourceType": "MedicationAdministration",
    "status": "completed",
    "whenGiven": {
        "start": "2010-07-31"
    },
    "dosage": [{
        "timingPeriod": {
            "start": "2010-07-31"
        }
    }],
    "prescription": {
        "reference": 4
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "ACE inhibitor or ARB + Lisinopril 10 MG Oral Tablet",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "314076",
                "display": "Lisinopril 10 MG Oral Tablet"
            }],
            "text": "Lisinopril 10 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "ACE inhibitor or ARB + Lisinopril 10 MG Oral Tablet"
    }
}, {
    "resourceType": "MedicationAdministration",
    "status": "completed",
    "whenGiven": {
        "end": "2012-08-06"
    },
    "dosage": [{
        "route": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "code": "C38216",
                "display": "RESPIRATORY (INHALATION)"
            }],
            "text": "RESPIRATORY (INHALATION)"
        },
        "quantity": {
            "value": 0.09,
            "units": "mg/actuat",
            "code": "mg/actuat",
            "system": "http://unitsofmeasure.org"
        },
        "timingPeriod": {
            "end": "2012-08-06"
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
    "prescription": {
        "reference": 5,
        "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
            }],
            "text": "Albuterol 0.09 MG/ACTUAT inhalant solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}];

linkedMedicationPresciptions = [{
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
            }]
        }
    }],
    "text": {
        "status": "generated",
        "div": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    },
    "contained": [{
        "resourceType": "Medication",
        "id": "med",
        "name": "Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
            }]
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2013-01-01",
    "dosageInstruction": [{
        "doseQuantity": {
            "value": 1,
            "units": "tablet",
            "code": "tablet",
            "system": "http://unitsofmeasure.org"
        },
        "timingPeriod": {
            "start": "2013-01-01",
            "end": "2013-01-31"
        }
    }],
    "text": {
        "status": "generated",
        "div": "take 1 tablet (25 mg) by oral route once daily for 30 days"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "metoprolol tartrate Oral Tablet 25 mg",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "866924",
                "display": "Metoprolol Tartrate 25 MG Oral Tablet"
            }],
            "text": "Metoprolol Tartrate 25 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "metoprolol tartrate Oral Tablet 25 mg"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2013-01-01",
    "dosageInstruction": [{
        "doseQuantity": {
            "value": 2
        },
        "timingPeriod": {
            "start": "2013-01-01",
            "end": "2013-01-31"
        }
    }],
    "text": {
        "status": "generated",
        "div": "inhale 2 puffs by inhalation route every 4 hours as needed for 30 days"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Proventil HFA Inhalation HFA Aerosol Inhaler 90 mcg/actuation",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "745679",
                "display": "200 ACTUAT Albuterol 0.09 MG/ACTUAT Metered Dose Inhaler"
            }],
            "text": "200 ACTUAT Albuterol 0.09 MG/ACTUAT Metered Dose Inhaler"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Proventil HFA Inhalation HFA Aerosol Inhaler 90 mcg/actuation"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2010-06-05",
    "dosageInstruction": [{
        "timingPeriod": {
            "start": "2010-06-05"
        }
    }],
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Antihypertensive combinations + Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "858828",
                "display": "Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet"
            }],
            "text": "Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Antihypertensive combinations + Enalapril Maleate 10 MG / Hydrochlorothiazide 25 MG Oral Tablet"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dateWritten": "2010-07-31",
    "dosageInstruction": [{
        "timingPeriod": {
            "start": "2010-07-31"
        }
    }],
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "ACE inhibitor or ARB + Lisinopril 10 MG Oral Tablet",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "314076",
                "display": "Lisinopril 10 MG Oral Tablet"
            }],
            "text": "Lisinopril 10 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "ACE inhibitor or ARB + Lisinopril 10 MG Oral Tablet"
    }
}, {
    "resourceType": "MedicationPrescription",
    "status": "active",
    "dosageInstruction": [{
        "route": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "code": "C38216",
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
            "repeat": {
                "frequency": 1,
                "duration": 12,
                "units": "h",
                "end": "2012-08-06"
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
        "id": "med",
        "resourceType": "Medication",
        "name": "Albuterol 0.09 MG/ACTUAT inhalant solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "573621",
                "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
            }],
            "text": "Albuterol 0.09 MG/ACTUAT inhalant solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Albuterol 0.09 MG/ACTUAT inhalant solution"
    }
}];
