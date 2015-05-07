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
    result.entryIds = options.entryIds;
    result.readTransform = options.readTransform;

    result.entryMapById = {};
    result.entryIds = [];
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
            if (self.entryMapById) {
                self.entryMapById[id] = sample;
            }
            if (self.entryIds) {
                self.entryIds.push(id);
            }
        })
        .end(done);
};

methods.read = function (sample, done) {
    var self = this;
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.get(path)
        .expect(200)
        .expect(function (res) {
            var resource = res.body;
            self.readTransform(resource);
            expect(resource).to.deep.equal(sample);
        })
        .end(done);
};

methods.readNegative = function (sample, done) {
    var self = this;
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.get(path)
        .expect(200)
        .expect(function (res) {
            var resource = res.body;
            self.readTransform(resource);
            expect(resource).to.not.deep.equal(sample);
        })
        .end(done);
};

methods.delete = function (sample, done) {
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.delete(path)
        .expect(200)
        .end(done);
};

methods.update = function (sample, done) {
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.put(path)
        .send(sample)
        .expect(200)
        .end(done);
};

methods.search = function (expectedCount, usePost, query, done) {
    var self = this;
    var request;
    if (usePost) {
        var postPath = util.format('/fhir/%s/_search', this.resourceType);
        request = this.api.post(postPath);
    } else {
        var getPath = util.format('/fhir/%s', this.resourceType);
        request = this.api.get(getPath);
    }
    if (query) {
        request.query(query);
    }
    request.expect(200)
        .expect(function (res) {
            var bundle = res.body;
            expect(bundle.entry).to.have.length(expectedCount);
            for (var j = 0; j < expectedCount; ++j) {
                var dbVital = bundle.entry[j].resource;
                self.readTransform(dbVital);
                expect(dbVital).to.deep.equal(self.entryMapById[dbVital.id]);
            }
        })
        .end(done);
};
