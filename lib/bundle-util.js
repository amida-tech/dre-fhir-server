'use strict';

exports.toDocument = function (resources) {
    var entry = resources.map(function (resource) {
        return {
            resource: resource
        };
    });
    var result = {
        resourceType: 'Bundle',
        type: 'document',
        total: resources.length,
        entry: entry
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
