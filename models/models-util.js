'use strict';

var bbu = require('blue-button-util');

var bbudt = bbu.datetime;

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

exports.paramsToBBRParams = (function () {
    var prefixMap = {
        '<': '$lt',
        '>': '$gt',
        '>=': '$gte',
        '<=': '$lte'
    };

    return function (params, map) {
        var keys = Object.keys(params);
        var queryObject = {};
        keys.forEach(function (key) {
            var target = map[key];
            if (target) {
                var paramsElement = params[key];
                var value = paramsElement.value;
                if (paramsElement.type === 'date') {
                    var modelDate = bbudt.dateToModel(value);
                    value = modelDate.date;
                }
                if (paramsElement.prefix) {
                    var op = prefixMap[paramsElement.prefix];
                    var valueWithAction = {};
                    valueWithAction[op] = value;
                    queryObject[target] = valueWithAction;
                } else {
                    queryObject[target] = value;
                }
            }
        });
        return queryObject;
    };
})();
