'use strict';

var chai = require('chai');

var expect = chai.expect;

var fpp = require('../../middleware/fhir-param-parser');

describe('fhir-param-parser', function () {
    it('basic', function () {
        var spec = [{
            name: 'param0',
            type: 'string'
        }, {
            name: 'param1',
            type: 'string'
        }];
        var fn = fpp(spec);
        var noop = function () {};
        var req = {
            query: {
                param0: 'value0',
                param1: 'value1'
            }
        };
        fn(req, null, noop);
        expect(req.fhirParams).to.deep.equal({
            param0: {
                value: 'value0',
                type: 'string'
            },
            param1: {
                value: 'value1',
                type: 'string'
            }
        });
    });

    it('modifiers', function () {
        var spec = [{
            name: 'param0',
            type: 'string'
        }, {
            name: 'param1',
            type: 'string'
        }, {
            name: 'param2',
            type: 'string'
        }];
        var fn = fpp(spec);
        var noop = function () {};
        var req = {
            query: {
                param0: 'value0',
                param1: 'value1',
                'param2:exact': 'value2'
            }
        };
        fn(req, null, noop);
        expect(req.fhirParams).to.deep.equal({
            param0: {
                value: 'value0',
                type: 'string'
            },
            param1: {
                value: 'value1',
                type: 'string'
            },
            param2: {
                value: 'value2',
                modifier: 'exact',
                type: 'string'
            }
        });
    });

    it('prefixes (string)', function () {
        var spec = [{
            name: 'param0',
            type: 'string'
        }, {
            name: 'param1',
            type: 'string'
        }];
        var fn = fpp(spec);
        var noop = function () {};
        var req = {
            query: {
                param0: '>=value0',
                'param1:exact': 'value1'
            }
        };
        fn(req, null, noop);
        expect(req.fhirParams).to.deep.equal({
            param0: {
                value: '>=value0',
                type: 'string'
            },
            param1: {
                value: 'value1',
                modifier: 'exact',
                type: 'string'
            }
        });
    });

    var types = ['number', 'date'];
    var prefixes = ['>=', '<=', '>', '<'];
    var prefiIt = function (type, prefix) {
        var spec = [{
            name: 'param0',
            type: type
        }, {
            name: 'param1',
            type: type
        }];
        return function () {
            var fn = fpp(spec);
            var noop = function () {};
            var req = {
                query: {
                    param0: prefix + 'value0',
                    'param1:exact': 'value1'
                }
            };
            fn(req, null, noop);
            expect(req.fhirParams).to.deep.equal({
                param0: {
                    value: 'value0',
                    prefix: prefix,
                    type: type
                },
                param1: {
                    value: 'value1',
                    modifier: 'exact',
                    type: type
                }
            });
        };
    };

    for (var i = 0; i < types.length; ++i) {
        for (var j = 0; j < prefixes.length; ++j) {
            var type = types[i];
            var prefix = prefixes[j];
            it('prefix ' + prefix + ' (' + type + ')', prefiIt(type, prefix));
        }
    }
});
