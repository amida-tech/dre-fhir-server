'use strict';

var util = require('util');
var _ = require('lodash');
var moment = require('moment');

var samples = require('../samples/patient-samples');
var supertestWrap = require('./supertest-wrap');
var appWrap = require('./app-wrap');
var common = require('./common');

var fn = common.generateTestItem;
var fnId = common.searchById;

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
    var resource0Clone = _.cloneDeep(resources[0]);
    resource0Clone.birthDate = '1978-06-09';
    resources.push(resource0Clone);
    var moments = {
        start: moment()
    };

    before(fn(appw, appw.start));

    it('check config (inits database as well)', fn(r, r.config));

    it('clear database', fn(appw, appw.cleardb));

    var n = resources.length;

    it('create patient 0 using update', fn(r, r.updateToCreate, [resources[0], moments]));
    _.range(1, n).forEach(function (i) {
        var title = util.format('create patient %s', i);
        it(title, fn(r, r.create, [resources[i], moments]));
    }, this);

    it('search all using get', fn(r, r.search, [n, {}]));
    it('search all using post', fn(r, r.searchByPost, [n, {}]));

    it('search not existing id', fn(r, r.search, [0, {
        _id: '123456789012345678901234'
    }]));

    _.range(n).forEach(function (i) {
        var title = util.format('search by id resource %s', i);
        it(title, fnId(r, r.search, resources[i]));
    }, this);

    it('search not existing family', fn(r, r.search, [0, {
        family: 'donotexist'
    }]));

    it('search by resource 0 family find 2', fn(r, r.search, [2, {
        family: resources[0].name[0].family[0]
    }]));

    it('search by resource 1 family find 1', fn(r, r.search, [1, {
        family: resources[1].name[0].family[0]
    }]));

    var birthDates = resources.map(function (resource) {
        return resource.birthDay;
    });
    birthDates.sort();
    var bbMiddleIndex = Math.floor(birthDates.length / 2);
    var bbMiddle = resources[bbMiddleIndex].birthDate;

    it('search by birthDate not existing', fn(r, r.search, [0, {
        birthDate: '1900-01-01'
    }]));
    it('search by birthDate find 1', fn(r, r.search, [1, {
        birthDate: bbMiddle
    }]));
    it('search by birthDate (use < )', fn(r, r.search, [bbMiddleIndex, {
        birthDate: '<' + bbMiddle
    }]));
    it('search by birthDate (use <= )', fn(r, r.search, [bbMiddleIndex + 1, {
        birthDate: '<=' + bbMiddle
    }]));
    it('search by birthDate (use >)', fn(r, r.search, [n - bbMiddleIndex - 1, {
        birthDate: '>' + bbMiddle
    }]));
    it('search by birthDate (use >=)', fn(r, r.search, [n - bbMiddleIndex, {
        birthDate: '>=' + bbMiddle
    }]));

    it('read missing (invalid id)', fn(r, r.readMissing, 'abc'));
    it('read missing (valid id)', fn(r, r.readMissing, '123456789012345678901234'));

    _.range(n).forEach(function (i) {
        var title = util.format('read resource %s', i);
        it(title, fn(r, r.read, [resources[i], moments, '1', false]));
    }, this);

    it('update missing (invalid id)', fn(r, r.updateInvalidId, [resources[0], 'abc']));

    it('update local resource 0', function () {
        resources[0].gender = 'female';
    });

    it('update local resource 1', function () {
        resources[1].birthDate = "1981-11-11";
    });

    _.range(2).forEach(function (i) {
        it(util.format('detect local resource %s not on server', i), fn(r, r.readNegative, resources[i]));
        it(util.format('update resource %s', i), fn(r, r.update, [resources[i], moments, '2']));
        it(util.format('read resource %s', i), fn(r, r.read, [resources[i], moments, '2', false]));
    });

    it('delete missing (invalid id)', fn(r, r.deleteMissing, 'abc'));
    it('delete missing (valid id)', fn(r, r.deleteMissing, '123456789012345678901234'));

    it('refresh moment start', function () {
        moments.start = moment();
    });

    it('delete last resource', fn(r, r.delete, resources[n - 1]));
    it('delete next to last resource', fn(r, r.delete, resources[n - 2]));

    it('search all using get', fn(r, r.search, [n - 2, {}]));

    it('update deleted last resource', fn(r, r.updateDeleted, resources[n - 1]));
    it('update deletes next to last resource', fn(r, r.updateDeleted, resources[n - 2]));

    it('read deleted last resource for patient 0', fn(r, r.read, [resources[n - 1], moments, '2', true]));
    it('read deleted last resource for patient 1', fn(r, r.read, [resources[n - 2], moments, '2', true]));

    after(fn(appw, appw.cleanUp));
});
