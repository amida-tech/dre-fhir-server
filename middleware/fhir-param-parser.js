'use strict';

module.exports = function (searchParam) {
    var searchParamDict = searchParam.reduce(function (r, p) {
        var name = p.name;
        r[name] = p;
        return r;
    }, {});

    ['searchId', 'page'].forEach(function (searchParam) {
        searchParamDict[searchParam] = {
            name: searchParam,
            type: 'string'
        };
    });

    return function (req, res, next) {
        var fhirParams = req.fhirParams = {};
        var query = req.query;
        Object.keys(query).forEach(function (key) {
            var keyPieces = key.split(':');
            var param = keyPieces[0];
            var paramSpec = searchParamDict[param];
            if (paramSpec) {
                var type = paramSpec.type;
                var paramDesc = {};
                if (keyPieces[1]) {
                    paramDesc.modifier = keyPieces[1];
                }
                var value = query[key];
                if ((type === 'number') || (type === 'date')) {
                    var prefixLen = 0;
                    var char0 = value.charAt(0);
                    if ((char0 === '>') || (char0 === '<')) {
                        prefixLen = 1;
                        if (value.charAt(1) === '=') {
                            prefixLen = 2;
                        }
                    }
                    if (prefixLen > 0) {
                        paramDesc.prefix = value.substring(0, prefixLen);
                        value = value.substring(prefixLen, value.length);
                    }
                }
                paramDesc.value = value;
                paramDesc.type = type;
                fhirParams[param] = paramDesc;
            }
        });
        next();
    };
};
