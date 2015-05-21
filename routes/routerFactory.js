'use strict';

var express = require('express');
var path = require('path');
var util = require('util');

var fpp = require('../middleware/fhir-param-parser');
var errUtil = require('../lib/error-util');

module.exports = (function () {
    var interactionToRoute = function (resourceType) {
        var typePath = util.format('/%s', resourceType);
        var instancePath = util.format('/%s/:id', resourceType);
        return {
            'read': [{
                'path': instancePath,
                'method': 'get'
            }],
            'update': [{
                'path': instancePath,
                'method': 'put'
            }],
            'delete': [{
                'path': instancePath,
                'method': 'delete'
            }],
            'create': [{
                'path': typePath,
                'method': 'post'
            }],
            'search-type': [{
                'path': typePath,
                'method': 'get'
            }, {
                'path': util.format('/%s/_search', resourceType),
                'method': 'post'
            }]
        };
    };

    var handleError = function (res, err) {
        var statusCode = errUtil.toStatus(err);
        res.status(statusCode);
        var operationOutcome = errUtil.toOperationOutcome(err);
        res.send(operationOutcome);
    };

    var interactionImplementation = {
        'read': function (model) {
            return function (req, res) {
                var c = req.app.get('connection');
                var id = req.params.id;

                model.read(c, id, function (err, resource, removed) {
                    if (err) {
                        handleError(res, err);
                    } else {
                        res.status(removed ? 410 : 200);
                        res.send(resource);
                    }
                });
            };
        },
        'update': function (model, resourceType) {
            return function (req, res) {
                var patient = req.body;
                var c = req.app.get('connection');
                var id = req.params.id;

                model.update(c, patient, function (err, updateInfo) {
                    if (err) {
                        handleError(res, err);
                    } else {
                        var contentLocation = [req.baseUrl, resourceType, updateInfo.id, '_history', updateInfo.versionId].join('/');
                        res.header('etag', updateInfo.versionId);
                        res.header('content-location', contentLocation);
                        res.header('last-modified', updateInfo.lastUpdated);
                        if (updateInfo.isCreated) {
                            res.status(201);
                            res.header('location', contentLocation);
                        } else {
                            res.status(200);
                        }
                        res.send();
                    }
                });
            };
        },
        'delete': function (model) {
            return function (req, res) {
                var c = req.app.get('connection');
                var id = req.params.id;

                model.delete(c, id, function (err, resource) {
                    if (err) {
                        handleError(res, err);
                    } else {
                        res.status(200);
                        res.send();
                    }
                });
            };

        },
        'create': function (model, resourceType) {
            return function (req, res) {
                var patient = req.body;
                var c = req.app.get('connection');
                model.create(c, patient, function (err, createInfo) {
                    if (err) {
                        handleError(res, err);
                    } else {
                        var location = [req.baseUrl, resourceType, createInfo.id, '_history', '1'].join('/');
                        res.status(201);
                        res.header('location', location);
                        res.header('content-location', location);
                        res.header('last-modified', createInfo.lastUpdated);
                        res.header('etag', '1');
                        res.send();
                    }
                });
            };
        },
        'search-type': function (model, resourceType, searchParam) {
            return [
                fpp(searchParam),
                function (req, res) {
                    var c = req.app.get('connection');
                    var params = req.fhirParams;
                    model.search(c, params, function (err, bundle) {
                        if (err) {
                            handleError(res, err);
                        } else {
                            res.status(200);
                            Object.keys(req.query).forEach(function (key) {
                                res.set(key, req.query[key]);
                            });
                            res.send(bundle);
                        }
                    });
                }
            ];
        }
    };

    return function (conformance) {
        var router = express.Router({
            caseSensitive: true
        });

        var rest = conformance.rest[0];
        rest.resource.forEach(function (resource) {
            var resourceType = resource.type;
            var modelName = resourceType.charAt(0).toLowerCase() + resourceType.substring(1, resourceType.length);
            var modelPath = path.join('..', 'models', modelName);
            var model = require(modelPath);
            var searchParam = resource.searchParam;

            resource.interaction.forEach(function (interaction) {
                var code = interaction.code;
                var implementation = interactionImplementation[code](model, resourceType, searchParam);
                var routeInfos = interactionToRoute(resourceType)[code];
                routeInfos.forEach(function (routeInfo) {
                    var path = routeInfo.path;
                    var method = routeInfo.method;
                    router[method](path, implementation);
                });
            });
        });

        router.get('/metadata', function (req, res) {
            res.status(200);
            res.send(conformance);
        });

        return router;
    };
})();
