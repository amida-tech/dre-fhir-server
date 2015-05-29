'use strict';

var issueDisplayMap = {
    'structure': "Structural Issue",
    'not-found': 'Not Found',
    'exception': 'Exception'
};

var errorCodeDetail = {
    fhirToModel: {
        key: 'fhirToModel',
        issueType: 'invalid.structure',
        statusCode: 400,
        severity: 'fatal'
    },
    createPatientMissing: {
        key: 'createPatientMissing',
        issueType: 'processing.not-found',
        statusCode: 400,
        severity: 'fatal'
    },
    createMedPrescriptionMissing: {
        key: 'createMedPrescriptionMissing',
        issueType: 'processing.not-found',
        statusCode: 400,
        severity: 'fatal'
    },
    readMissing: {
        key: 'readMissing',
        issueType: 'processing.not-found',
        statusCode: 404,
        severity: 'fatal'
    },
    updateInvalidId: {
        key: 'updateInvalidId',
        issueType: 'processing.not-found',
        statusCode: 404,
        severity: 'fatal'
    },
    updateDeleted: {
        key: 'updateDeleted',
        issueType: 'processing.not-found',
        statusCode: 404,
        severity: 'fatal'
    },
    deleteMissing: {
        key: 'deleteMissing',
        issueType: 'processing.not-found',
        statusCode: 404,
        severity: 'fatal'
    },
    internalDbError: {
        key: 'internalDbError',
        issueType: 'transient.exception',
        statusCode: 500,
        severity: 'fatal'
    },
    internalError: {
        key: 'internalError',
        issueType: 'transient.exception',
        statusCode: 500,
        severity: 'fatal'
    }
};

exports.toOperationOutcome = function (err) {
    var codeDetail = err.codeDetail;
    var issueCode = codeDetail.issueType.split('.')[1];
    var issueDisplay = issueDisplayMap[issueCode];
    var result = {
        resourceType: 'OperationOutcome',
        issue: [{
            severity: codeDetail.severity,
            details: err.message,
            coding: [{
                system: 'http://hl7.org/fhir/issue-type',
                code: issueCode,
                display: issueDisplay
            }]
        }]
    };
    return result;
};

exports.toStatus = function (err) {
    return err.codeDetail.statusCode;
};

exports.error = function (code, message) {
    var err = new Error(message);
    var detail = errorCodeDetail[code];
    if (detail) {
        err.codeDetail = detail;
    } else {
        err.codeDetail = errorCodeDetail.internalError;
    }
    return err;
};
