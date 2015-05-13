'use strict';

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
    readMissing: {
        key: 'readMissing',
        issueType: 'processing.not-found',
        statusCode: 404,
        severity: 'fatal'
    },
    updateMissing: {
        key: 'updateMissing',
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
