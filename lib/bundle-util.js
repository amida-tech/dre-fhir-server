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

exports.toSearchSet = function (bundleEntry, searchInfo) {
    var result = {
        resourceType: 'Bundle',
        type: 'searchset'
    };
    if (!searchInfo) {
        result.total = bundleEntry.length;
    } else {
        result.total = searchInfo.total;
    }
    result.entry = bundleEntry;
    return result;
};
