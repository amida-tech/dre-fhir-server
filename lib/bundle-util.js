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

exports.mergeBundles = function (bundle0, bundle1) {
    var entry = bundle0.entry.concat(bundle1.entry);
    return {
        resourceType: 'Bundle',
        total: bundle0.length + bundle1.length,
        entry: entry
    };
};
