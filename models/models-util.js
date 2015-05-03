'use strict';

exports.saveResourceAsSource = function (connection, ptKey, resource, callback) {
    var resourceAsText = JSON.stringify(resource, undefined, 4);
    var metaData = {
        type: 'application/json+fhir',
        name: 'fhir.patient',
        size: resourceAsText.length
    };
    connection.saveSource(ptKey, resourceAsText, metaData, 'fhir', callback);
};

exports.findPatientKey = function (connection, resource, patientProperty, callback) {
    var p = resource[patientProperty];
    var reference = p && p.reference;
    if (!reference) {
        callback(new Error('No patient specified'));
    } else {
        connection.idToPatientKey('demographics', reference, function (err, ptKey) {
            if (err) {
                callback(err);
            } else {
                if (ptKey) {
                    callback(null, ptKey);
                } else {
                    callback(new Error('Patient Not Found'));
                }
            }
        });
    }
};
