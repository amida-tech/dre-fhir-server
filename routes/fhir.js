'use strict';

var express = require('express');
var path = require('path');

var fpp = require('../middleware/fhir-param-parser');

module.exports = (function () {
    var interactionToRoute = {
        'read': [{
            'path': '/Patient/:id',
            'method': 'get'
        }],
        'update': [{
            'path': '/Patient/:id',
            'method': 'put'
        }],
        'delete': [{
            'path': '/Patient/:id',
            'method': 'delete'
        }],
        'create': [{
            'path': '/Patient',
            'method': 'post'
        }],
        'search-type': [{
            'path': '/Patient',
            'method': 'get'
        }, {
            'path': '/Patient/_search',
            'method': 'post'
        }]
    };

    var interactionImplementation = {
        'read': function (model) {
            return function (req, res) {
                var c = req.app.get('connection');
                var id = req.params.id;

                model.read(c, id, function (err, resource) {
                    if (err) {
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.send(resource);
                    }
                });
            };
        },
        'update': function (model) {
            return function (req, res) {
                var patient = req.body;
                var c = req.app.get('connection');
                var id = req.params.id;

                model.update(c, patient, function (err) {
                    if (err) {
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
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
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.send();
                    }
                });
            };

        },
        'create': function (model) {
            return function (req, res) {
                var patient = req.body;
                var c = req.app.get('connection');
                model.create(c, patient, function (err, id) {
                    if (err) {
                        res.status(400);
                        res.send(err);
                    } else {
                        var location = [req.baseUrl, 'Patient', id, '_history', '1'].join('/');
                        res.status(201);
                        res.location(location);
                        res.header('ETag', '1');
                        res.send();
                    }
                });
            };
        },
        'search-type': function (model, searchParam) {
            return [
                fpp(searchParam),
                function (req, res) {
                    var c = req.app.get('connection');
                    var params = req.fhirParams || {};
                    model.search(c, params, function (err, bundle) {
                        if (err) {
                            res.status(500);
                            res.send(err);
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
            var modelName = resourceType.toLowerCase();
            var modelPath = path.join('..', 'models', modelName);
            var model = require(modelPath);
            var searchParam = resource.searchParam;

            resource.interaction.forEach(function (interaction) {
                var code = interaction.code;
                var implementation = interactionImplementation[code](model, searchParam);
                var routeInfos = interactionToRoute[code];
                routeInfos.forEach(function (routeInfo) {
                    var path = routeInfo.path;
                    var method = routeInfo.method;
                    router[method](path, implementation);
                });
            });
        });

        return router;
    };
})();
