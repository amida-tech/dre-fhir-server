"use strict";

var _ = require('lodash');

var medicationStatements;

exports.set0 = function () {
    var result = _.cloneDeep(medicationStatements);
    return result.slice(0, 3);
};

exports.set1 = function () {
    var result = _.cloneDeep(medicationStatements);
    return result.slice(3, 6);
};

medicationStatements = [{
    "resourceType": "MedicationStatement",
    "status": "in-progress",
    "dosage": [{
        "route": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "code": "C38276",
                "display": "INTRAVENOUS"
            }],
            "text": "INTRAVENOUS"
        },
        "quantity": {
            "value": 2,
            "units": "Grams"
        },
        "schedule": {
            "repeat": {
                "period": 24,
                "periodUnits": "h"
            }
        }
    }],
    "effectivePeriod": {
        "start": "2014-08-06"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Ceftriaxone 2 grams IV",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "1152108",
                "display": "Ceftriaxone 2 grams IV"
            }],
            "text": "Ceftriaxone 2 grams IV"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Ceftriaxone 2 grams IV"
    }
}, {
    "resourceType": "MedicationStatement",
    "status": "in-progress",
    "dosage": [{
        "quantity": {
            "value": 2.5,
            "units": "mg/3ml"
        },
        "schedule": {
            "repeat": {
                "period": 8,
                "periodUnits": "h"
            }
        }
    }],
    "effectivePeriod": {
        "start": "2014-08-06"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Albuterol Inhaled 2.5mg/3ml NEB",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "1154602",
                "display": "Albuterol Inhaled 2.5mg/3ml NEB"
            }],
            "text": "Albuterol Inhaled 2.5mg/3ml NEB"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Albuterol Inhaled 2.5mg/3ml NEB"
    }
}, {
    "resourceType": "MedicationStatement",
    "status": "in-progress",
    "dosage": [{
        "quantity": {
            "value": 1
        },
        "schedule": {
            "repeat": {
                "period": 12,
                "periodUnits": "h"
            }
        }
    }],
    "effectivePeriod": {
        "start": "2013-01-30"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Oseltamivir 30 MG Oral Capsule",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "728111",
                "display": "Oseltamivir 30 MG Oral Capsule"
            }],
            "text": "Oseltamivir 30 MG Oral Capsule"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Oseltamivir 30 MG Oral Capsule"
    }
}, {
    "resourceType": "MedicationStatement",
    "status": "in-progress",
    "dosage": [{
        "route": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "code": "C38299",
                "display": "SUBCUTANEOUS"
            }],
            "text": "SUBCUTANEOUS"
        },
        "quantity": {
            "value": 40,
            "units": "units"
        }
    }],
    "effectivePeriod": {
        "start": "2009-01-09"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Lantus 100 units/mL subcutaneous solution",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "285018",
                "display": "Lantus 100 units/mL subcutaneous solution"
            }],
            "text": "Lantus 100 units/mL subcutaneous solution"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Lantus 100 units/mL subcutaneous solution"
    }
}, {
    "resourceType": "MedicationStatement",
    "status": "in-progress",
    "effectivePeriod": {
        "start": "2013-07-01"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Desonide (Topical) Topical Ointment 0.0005 mg/mg",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "204135",
                "display": "Desonide (Topical) Topical Ointment 0.0005 mg/mg"
            }],
            "text": "Desonide (Topical) Topical Ointment 0.0005 mg/mg"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Desonide (Topical) Topical Ointment 0.0005 mg/mg"
    }
}, {
    "resourceType": "MedicationStatement",
    "status": "in-progress",
    "effectivePeriod": {
        "start": "2011-07-15"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Hydrocortisone (Topical) Topical Gel 0.01 mg/mg",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "198706",
                "display": "Hydrocortisone (Topical) Topical Gel 0.01 mg/mg"
            }],
            "text": "Hydrocortisone (Topical) Topical Gel 0.01 mg/mg"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Hydrocortisone (Topical) Topical Gel 0.01 mg/mg"
    }
}, {
    "resourceType": "MedicationStatement",
    "status": "completed",
    "dosage": [{
        "route": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "code": "C38288",
                "display": "oral"
            }],
            "text": "oral"
        },
        "quantity": {
            "value": 1
        },
        "schedule": {
            "repeat": {
                "period": 24,
                "periodUnits": "h"
            }
        }
    }],
    "effectivePeriod": {
        "start": "2012-11-01",
        "end": "2012-12-31"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Flomax - 0.4mg by mouth once daily",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "863671",
                "display": "Flomax 0.4 MG Oral Capsule"
            }],
            "text": "Flomax 0.4 MG Oral Capsule"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Flomax - 0.4mg by mouth once daily"
    }
}, {
    "id": "MedicationStatement/37",
    "resourceType": "MedicationStatement",
    "status": "completed",
    "dosage": [{
        "route": {
            "coding": [{
                "system": "urn:oid:2.16.840.1.113883.3.26.1.1",
                "code": "C38288",
                "display": "oral"
            }],
            "text": "oral"
        },
        "quantity": {
            "value": 1
        },
        "schedule": {
            "repeat": {
                "period": 24,
                "periodUnits": "h"
            }
        }
    }],
    "effectivePeriod": {
        "start": "2012-11-01",
        "end": "2012-12-31"
    },
    "contained": [{
        "id": "med",
        "resourceType": "Medication",
        "name": "Proscar - 5mg by mouth once daily",
        "code": {
            "coding": [{
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "201961",
                "display": "Proscar 5 MG Oral Tablet"
            }],
            "text": "Proscar 5 MG Oral Tablet"
        }
    }],
    "medication": {
        "reference": "#med",
        "display": "Proscar - 5mg by mouth once daily"
    }
}];
