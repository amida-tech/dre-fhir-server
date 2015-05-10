'use strict';

var util = require('util');
var _ = require('lodash');

var samples = require('../samples/patient-samples');
var supertestWrap = require('./supertest-wrap');
var appWrap = require('./app-wrap');
var common = require('./common');

var fn = common.generateTestItem;

var resourceType = 'Patient';
var testTitle = util.format('%s routes', resourceType);

describe(testTitle, function () {
    var dbName = util.format('fhir%sapi', resourceType.toLowerCase());
    var appw = appWrap.instance(dbName);
    var r = supertestWrap({
        appWrap: appw,
        resourceType: resourceType,
    });

    var resources = samples();

    before(fn(appw, appw.start));

    it('check config (inits database as well)', fn(r, r.config));

    it('clear database', fn(appw, appw.cleardb));

    var n = resources.length;

    _.range(n).forEach(function (i) {
        var title = util.format('create patient %s', i);
        it(title, fn(r, r.create, resources[i]));
    }, this);

    it('search all using get', fn(r, r.search, [n, {}]));
    it('search all using post', fn(r, r.searchByPost, [n, {}]));

    _.range(n).forEach(function (i) {
        var title = util.format('read resource %s', i);
        it(title, fn(r, r.read, resources[i]));
    }, this);

    it('update local resource 0', function () {
        resources[0].gender = 'female';
    });

    it('update local resource 1', function () {
        resources[1].birthDate = "1981-11-11";
    });

    _.range(2).forEach(function (i) {
        it(util.format('detect local resource %s not on server', i), fn(r, r.readNegative, resources[i]));
        it(util.format('update resource %s', i), fn(r, r.update, resources[i]));
        it(util.format('read resource %s', i), fn(r, r.read, resources[i]));
    });

    it('delete last resource', fn(r, r.delete, resources[n - 1]));
    it('delete next to last resource', fn(r, r.delete, resources[n - 2]));

    it('search all using get', fn(r, r.search, [n - 2, {}]));

    after(fn(appw, appw.cleanUp));
});
