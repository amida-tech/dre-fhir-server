'use strict';

var request = require('supertest');
var chai = require('chai');

var expect = chai.expect;
var fhirApp = require('../config/app');

var errorUtil = require('../lib/error-util');

describe('default error handler', function () {
    var app;
    var server;
    var api;

    before(function (done) {
        app = fhirApp();
        server = app.listen(3001, done);
        api = request.agent(app);
    });

    it('missing path', function (done) {
        api.get('/xxxxxx')
            .expect(404)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    expect(res.body.error).to.exists;
                    done();
                }
            });
    });
});

describe('error-util', function () {
    it('unknownn error code', function () {
        var err = errorUtil.error('xxxxx', 'detail');
        expect(err.codeDetail).to.exist;
        expect(err.codeDetail.key).to.equal('internalError');
    });
});
