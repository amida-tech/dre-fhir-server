'use strict';

var util = require('util');

var chai = require('chai');
var _ = require('lodash');
var moment = require('moment');

var expect = chai.expect;

var base = {};

module.exports = function (options) {
    var result = Object.create(base);

    result.appWrap = options.appWrap;
    result.resourceType = options.resourceType;
    result.readTransform = options.readTransform;

    result.api = result.appWrap.api();
    result.entryMapById = {};
    result.entryIds = [];

    return result;
};

base.config = function (done) {
    var self = this;
    this.api.get('/config')
        .expect(200)
        .expect(function (res) {
            var dbName = self.dbName;
            expect(res.body.db.dbName).to.equal(self.appWrap.dbName);
        })
        .end(done);
};

base.createNegative = function (sample, done) {
    var path = util.format('/fhir/%s', this.resourceType);
    this.api.post(path)
        .expect(400)
        .send(sample)
        .end(done);
};

base.create = function (sample, done) {
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

base.read = function (sample, moments, versionId, expectedRemoved, done) {
    var self = this;
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.get(path)
        .expect(expectedRemoved ? 410 : 200)
        .expect(function (res) {
            var resource = res.body;
            if (self.readTransform) {
                self.readTransform(resource);
            }
            var meta = resource.meta;
            expect(meta).to.exist;
            delete resource.meta;
            expect(resource).to.deep.equal(sample);
            expect(meta.versionId).to.equal(versionId);
            var momentMeta = moment(meta.lastUpdated);
            expect(momentMeta.isValid()).to.equal(true);
            var momentNow = moment();
            expect(momentMeta.isBetween(moments.start, momentNow)).to.equal(true);
        })
        .end(done);
};

base.readMissing = function (id, done) {
    var self = this;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.get(path)
        .expect(404)
        .end(done);
};

base.readNegative = function (sample, done) {
    var self = this;
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.get(path)
        .expect(200)
        .expect(function (res) {
            var resource = res.body;
            if (self.readTransform) {
                self.readTransform(resource);
            }
            delete resource.meta;
            expect(resource).to.not.deep.equal(sample);
        })
        .end(done);
};

base.delete = function (sample, done) {
    var self = this;
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.delete(path)
        .expect(200)
        .expect(function (res) {
            var index = self.entryIds.indexOf(id);
            expect(index).to.be.above(-1);
            self.entryIds.splice(index, 1);
            delete self.entryMapById[id];
        })
        .end(done);
};

base.deleteMissing = function (id, done) {
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.delete(path)
        .expect(404)
        .end(done);
};

base.update = function (sample, done) {
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    this.api.put(path)
        .send(sample)
        .expect(200)
        .end(done);
};

base.updateMissing = function (sample, badId, done) {
    var sampleClone = _.cloneDeep(sample);
    sampleClone.id = badId;
    var path = util.format('/fhir/%s/%s', this.resourceType, badId);
    this.api.put(path)
        .send(sampleClone)
        .expect(404)
        .end(done);
};

base.updateDeleted = function (sample, done) {
    var path = util.format('/fhir/%s/%s', this.resourceType, sample.id);
    this.api.put(path)
        .send(sample)
        .expect(404)
        .end(done);
};

base._search = function (req, expectedCount, query, done) {
    var self = this;
    if (query) {
        req.query(query);
    }
    req.expect(200)
        .expect(function (res) {
            var bundle = res.body;
            expect(bundle.entry).to.have.length(expectedCount);
            for (var j = 0; j < expectedCount; ++j) {
                var serverResource = bundle.entry[j].resource;
                if (self.readTransform) {
                    self.readTransform(serverResource);
                }
                expect(serverResource).to.deep.equal(self.entryMapById[serverResource.id]);
            }
        })
        .end(done);
};

base.searchByPost = function (expectedCount, query, done) {
    var path = util.format('/fhir/%s/_search', this.resourceType);
    var req = this.api.post(path);
    this._search(req, expectedCount, query, done);
};

base.search = function (expectedCount, query, done) {
    var path = util.format('/fhir/%s', this.resourceType);
    var req = this.api.get(path);
    this._search(req, expectedCount, query, done);
};
