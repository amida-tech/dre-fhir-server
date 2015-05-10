'use strict';

var util = require('util');

var request = require('supertest');
var chai = require('chai');

var expect = chai.expect;
var config = require('../../config/config.json');
var appWrap = require('./app-wrap');
var common = require('./common');

var fn = common.generateTestItem;

var resourceType = 'metadata';
var testTitle = util.format('%s routes', resourceType);

describe(testTitle, function () {
    var dbName = util.format('fhir%sapi', resourceType.toLowerCase());
    var appw = appWrap.instance(dbName);
    var api = appw.api();

    before(fn(appw, appw.start));

    it('check metadata', function (done) {
        api.get('/fhir/metadata')
            .expect(200)
            .expect(function (res) {
                expect(res.body).to.deep.equal(config.conformance);
            })
            .end(done);
    });

    after(fn(appw, appw.cleanUp));
});
