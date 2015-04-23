'use strict';

exports.saveResourceAsSource = function (dbConnection, ptKey, resource, callback) {
    var resourceAsText = JSON.stringify(resource, undefined, 4);
    var metaData = {
        type: 'application/json+fhir',
        name: 'fhir.patient',
        size: resourceAsText.length
    };
    dbConnection.saveSource(ptKey, resourceAsText, metaData, 'fhir', callback);
};
