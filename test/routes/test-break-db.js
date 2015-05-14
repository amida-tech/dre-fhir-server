'use strict';

var util = require('util');
var bbr = require('blue-button-record');
var request = require('supertest');

var appm = require('../../config/app');
var samples = require('../samples/condition-samples');

describe('db level error handling', function () {
    var fn = function () {
        console.log('here');
        throw new Error('artificial error');
    };
    var bbrReplacement = Object.keys(bbr).forEach(function (r, method) {
        r[method] = fn;
        return r;
    }, {});
    var dbware = function (req, res, next) {
        req.app.set('connection', bbrReplacement);
        next();
    };

    var app = appm({
        dbware: dbware
    });
    var api = request.agent(app);

    var server;

    var resources = samples.set0();

    before(function (done) {
        server = app.listen(3001, done);
    });

    it('check config (inits database as well)', function (done) {
        api.get('/config')
            .expect(200)
            .end(done);
    });

    it('create invalid resource', function (done) {
        var path = util.format('/fhir/%s', 'Condition');
        api.post(path)
            .send({})
            .expect(400)
            .end(done);
    });

    it('create', function (done) {
        var path = util.format('/fhir/%s', 'Condition');
        api.post(path)
            .send(resources[0])
            .expect(400)
            .end(done);
    });

    it('read', function (done) {
        var path = util.format('/fhir/%s/%s', 'Condition', '123456789012345678901234');
        api.get(path)
            .expect(500)
            .end(done);
    });

    after(function (done) {
        server.close(done);
    });
});
