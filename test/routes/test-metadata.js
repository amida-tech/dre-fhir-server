'use strict';

var request = require('supertest');
var chai = require('chai');
var _ = require('lodash');

var expect = chai.expect;
var fhirApp = require('../../config/app');
var config = require('../../config/config.json');

describe('metadata route', function () {
    var app;
    var server;
    var api;

    before(function (done) {
        app = fhirApp({
            db: {
                "dbName": "fhirmetadata"
            }
        });
        server = app.listen(3001, done);
        api = request.agent(app);
    });

    it('check metadata', function (done) {
        api.get('/fhir/metadata')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    expect(res.body).to.deep.equal(config.conformance);
                    done();
                }
            });
    });

    it('clear database', function (done) {
        var c = app.get('connection');
        c.clearDatabase(done);
    });

    after(function (done) {
        var c = app.get('connection');
        c.disconnect(function (err) {
            if (err) {
                done(err);
            } else {
                server.close(done);
            }
        });
    });
});
