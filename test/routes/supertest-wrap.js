'use strict';

var util = require('util');

var chai = require('chai');
var _ = require('lodash');
var moment = require('moment');
var sinon = require('sinon');

var expect = chai.expect;

var base = {};

var errUtil = require('../../lib/error-util.js');

module.exports = function (options) {
    var result = Object.create(base);

    result.appWrap = options.appWrap;
    result.resourceType = options.resourceType;
    result.readTransform = options.readTransform;

    result.api = result.appWrap.api();
    result.entryMapById = {};
    result.entryIds = [];
    result.manualId = '023456789012345678901234';

    return result;
};

base.incrementManualId = function () {
    var n = this.manualId.length;
    var lastFour = this.manualId.substring(n - 4, n);
    lastFour = (parseInt(lastFour) + 1).toString();
    this.manualId = this.manualId.substring(0, n - 4) + lastFour;
    return this.manualId;
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

base.create = function (sample, moments, done) {
    var self = this;
    var path = util.format('/fhir/%s', this.resourceType);
    this.api.post(path)
        .send(sample)
        .expect(201)
        .expect(function (res) {
            var momentStart = moments.start;
            var location = res.header.location;
            var p = location.split('/');
            expect(p).to.have.length(6);
            var id = p[3];
            p[3] = '';
            expect(p).to.deep.equal(['', 'fhir', self.resourceType, '', '_history', '1']);
            var etag = res.header['etag'];
            expect(etag).to.be.equal('1');
            var contentLocation = res.header['content-location'];
            expect(contentLocation).to.be.equal(location);
            var lastUpdated = res.header['last-modified'];
            expect(lastUpdated).to.exist;
            var momentMeta = moment(lastUpdated);
            expect(momentMeta.isValid()).to.equal(true);
            var momentNow = moment();
            expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
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

base.update = function (sample, moments, versionId, done) {
    var id = sample.id;
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    var self = this;
    this.api.put(path)
        .send(sample)
        .expect(200)
        .expect(function (res) {
            var momentStart = moments.start;
            var location = res.header['content-location'];
            var p = location.split('/');
            expect(p).to.have.length(6);
            var id = p[3];
            p[3] = '';
            expect(p).to.deep.equal(['', 'fhir', self.resourceType, '', '_history', versionId]);
            var etag = res.header['etag'];
            expect(etag).to.be.equal(versionId);
            var lastUpdated = res.header['last-modified'];
            expect(lastUpdated).to.exist;
            var momentMeta = moment(lastUpdated);
            expect(momentMeta.isValid()).to.equal(true);
            var momentNow = moment();
            expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
        })
        .end(done);
};

base.updateToCreate = function (sample, moments, done) {
    var id = this.incrementManualId();
    var path = util.format('/fhir/%s/%s', this.resourceType, id);
    sample.id = id;
    var self = this;
    this.api.put(path)
        .send(sample)
        .expect(201)
        .expect(function (res) {
            var momentStart = moments.start;
            var location = res.header['content-location'];
            expect(res.header.location).to.equal(location);
            var p = location.split('/');
            expect(p).to.have.length(6);
            expect(p[3]).to.be.equal(id);
            p[3] = '';
            expect(p).to.deep.equal(['', 'fhir', self.resourceType, '', '_history', '1']);
            var etag = res.header['etag'];
            expect(etag).to.be.equal('1');
            var lastUpdated = res.header['last-modified'];
            expect(lastUpdated).to.exist;
            var momentMeta = moment(lastUpdated);
            expect(momentMeta.isValid()).to.equal(true);
            var momentNow = moment();
            expect(momentMeta.isBetween(momentStart, momentNow)).to.equal(true);
            if (self.entryMapById) {
                self.entryMapById[id] = sample;
            }
            if (self.entryIds) {
                self.entryIds.push(id);
            }
        })
        .end(done);
};

base.updateInvalidId = function (sample, badId, done) {
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

base.searchError = function (model, done) {
    var path = util.format('/fhir/%s', this.resourceType);
    var req = this.api.get(path);
    var stub = sinon.stub(model, 'search', function () {
        var err = errUtil.error('internalDbError', 'searcherror');
        arguments[arguments.length - 1](err);
    });
    var self = this;
    req.expect(500)
        .expect(function (res) {
            stub.restore();
        })
        .end(done);
};
