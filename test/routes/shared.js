'use strict';

var util = require('util');

var request = require('supertest');
var chai = require('chai');

var expect = chai.expect;

var methods = {};

module.exports = function (options) {
    var result = Object.create(methods);
    result.app = options.app;
    result.server = options.server;
    result.api = options.api;
    result.dbName = options.dbName;
    result.resourceType = options.resourceType;
    return result;
};

methods.getConfig = function (done) {
    var self = this;
    this.api.get('/config')
        .expect(200)
        .expect(function (res) {
            var dbName = self.dbName;
            expect(res.body.db.dbName).to.equal(dbName);
        })
        .end(done);
};

methods.clearDatabase = function (done) {
    var c = this.app.get('connection');
    c.clearDatabase(done);
};

methods.failCreate = function (sample, done) {
    var path = util.format('/fhir/%s', this.resourceType);
    this.api.post(path)
        .send(sample)
        .expect(400)
        .end(done);
};

methods.create = function (sample, done) {
    var self = this;
    var path = util.format('/fhir/%s', this.resourceType);
    this.api.post(path)
        .send(sample)
        .expect(201)
        .expect(function (res) {
            var location = res.header.location;
            var p = location.split('/');
            expect(p).to.have.length(6);
            var id = p[3];
            p[3] = '';
            expect(p).to.deep.equal(['', 'fhir', self.resourceType, '', '_history', '1']);
            sample.id = id;
        })
        .end(done);
};
