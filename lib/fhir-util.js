'use strict';

exports.toBundle = function (resource) {
    var result = {
        resourceType: 'Bundle',
        total: 1,
        entry: [{
            resource: resource
        }]
    };
    return result;
};
