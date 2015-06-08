'use strict';

var util = require('util');
var _ = require('lodash');
var moment = require('moment');

var samples = require('../samples/medicationStatement-samples');
var patientSamples = require('../samples/patient-samples')();
var supertestWrap = require('./supertest-wrap');
var appWrap = require('./app-wrap');
var common = require('./common');

var model = require('../../models/medicationStatement');

var fn = common.generateTestItem;
var fnId = common.searchById;
var fnPt = common.searchByPatient;

var resourceType = 'MedicationStatement';
var testTitle = util.format('%s routes', resourceType);
var patientProperty = 'patient';

describe(testTitle, function () {
    var dbName = util.format('fhir%sapi', resourceType.toLowerCase());
    var appw = appWrap.instance(dbName);
    var r = supertestWrap({
        appWrap: appw,
        resourceType: resourceType,
        readTransform: function (resource) {
            delete resource[patientProperty].display;
        }
    });
    var pt = supertestWrap({
        appWrap: appw,
        resourceType: 'Patient'
    });

    var resourceSets = [samples.set0(), samples.set1()];
    var moments = {
        start: moment()
    };

    before(fn(appw, appw.start));

    it('check config (inits database as well)', fn(r, r.config));

    it('clear database', fn(appw, appw.cleardb));

    it('fail to create resource 0 for patient 0 with patient ref missing', fn(r, r.createNegative, resourceSets[0][0]));

    _.range(2).forEach(function (index) {
        var title = util.format('create patient %s', index);
        it(title, fn(pt, pt.create, [patientSamples[index], moments]));
    }, this);

    it('assign patient refs to all resources', function () {
        common.putPatientRefs(resourceSets, patientSamples, patientProperty);
    });

    _.range(2).forEach(function (i) {
        var updTitle = util.format('create resource %s for patient %s using update', 0, i);
        it(updTitle, fn(r, r.updateToCreate, [resourceSets[i][0], moments]));
        _.range(1, resourceSets[i].length).forEach(function (j) {
            var title = util.format('create resource %s for patient %s', j, i);
            it(title, fn(r, r.create, [resourceSets[i][j], moments]));
        }, this);
    }, this);

    it('search error', fn(r, r.searchError, [model]));
    var n = resourceSets[0].length + resourceSets[1].length;
    it('search all using get', fn(r, r.search, [n, {}]));
    it('search all using post', fn(r, r.searchByPost, [n, {}]));

    it('search not existing id', fn(r, r.search, [0, {
        _id: '123456789012345678901234'
    }]));

    _.range(2).forEach(function (i) {
        _.range(resourceSets[i].length).forEach(function (j) {
            var title = util.format('search by id resource %s for patient %s', j, i);
            it(title, fnId(r, r.search, resourceSets[i][j]));
        }, this);
    }, this);

    _.range(2).forEach(function (i) {
        var title = util.format('search by patient %s', i);
        it(title, fnPt(r, r.search, patientSamples[i], patientProperty, resourceSets[i].length));
    }, this);

    it('read missing (invalid id)', fn(r, r.readMissing, 'abc'));
    it('read missing (valid id)', fn(r, r.readMissing, '123456789012345678901234'));

    _.range(2).forEach(function (i) {
        _.range(resourceSets[i].length).forEach(function (j) {
            var title = util.format('read resource %s for patient %s', j, i);
            it(title, fn(r, r.read, [resourceSets[i][j], moments, '1', false]));
        }, this);
    }, this);

    it('update missing (invalid id)', fn(r, r.updateInvalidId, [resourceSets[0][0], 'abc']));

    it('update local resource 0 for patient 0', function () {
        resourceSets[0][0].effectivePeriod = {
            start: '2015-01-01'
        };
    });

    it('update local resource 0 for patient 1', function () {
        resourceSets[1][0].effectivePeriod = {
            start: '2015-02-01'
        };
    });

    _.range(2).forEach(function (i) {
        var ptTitle = util.format(' for patient %s', i);
        it('detect resource 0 not on server' + ptTitle, fn(r, r.readNegative, resourceSets[i][0]));
        it('update resource 0' + ptTitle, fn(r, r.update, [resourceSets[i][0], moments, '2']));
        it('read resource 0' + ptTitle, fn(r, r.read, [resourceSets[i][0], moments, '2', false]));
    }, this);

    it('delete missing (invalid id)', fn(r, r.deleteMissing, 'abc'));
    it('delete missing (valid id)', fn(r, r.deleteMissing, '123456789012345678901234'));

    var n0 = resourceSets[0].length - 1;
    var n1 = resourceSets[1].length - 1;

    it('refresh moment start', function () {
        moments.start = moment();
    });

    it('delete last resource for patient 0', fn(r, r.delete, resourceSets[0][n0]));
    it('delete last resource for patient 1', fn(r, r.delete, resourceSets[1][n1]));

    it('search all using get', fn(r, r.search, [n0 + n1, {}]));

    it('update deleted last resource for patient 0', fn(r, r.updateDeleted, resourceSets[0][n0]));
    it('update deletes last resource for patient 1', fn(r, r.updateDeleted, resourceSets[1][n1]));

    it('read deleted last resource for patient 0', fn(r, r.read, [resourceSets[0][n0], moments, '2', true]));
    it('read deleted last resource for patient 1', fn(r, r.read, [resourceSets[1][n1], moments, '2', true]));

    after(fn(appw, appw.cleanUp));
});

describe(testTitle + ' search by page', function () {
    var dbName = util.format('fhir%sapipage', resourceType.toLowerCase());
    var appw = appWrap.instance(dbName, 5);
    var r = supertestWrap({
        appWrap: appw,
        resourceType: resourceType,
        readTransform: function (resource) {
            delete resource[patientProperty].display;
        },
        pageSize: 5
    });
    var pt = supertestWrap({
        appWrap: appw,
        resourceType: 'Patient'
    });

    var resourceSets = common.multiplySampleSets(4, [samples.set0(), samples.set1()]);
    var moments = {
        start: moment()
    };

    before(fn(appw, appw.start));

    it('check config (inits database as well)', fn(r, r.config));

    it('clear database', fn(appw, appw.cleardb));

    _.range(2).forEach(function (index) {
        var title = util.format('create patient %s', index);
        it(title, fn(pt, pt.create, [patientSamples[index], moments]));
    }, this);

    it('assign patient refs to all resources', function () {
        common.putPatientRefs(resourceSets, patientSamples, patientProperty);
    });

    _.range(2).forEach(function (i) {
        _.range(resourceSets[i].length).forEach(function (j) {
            var title = util.format('create resource %s for patient %s', j, i);
            it(title, fn(r, r.create, [resourceSets[i][j], moments]));
        }, this);
    }, this);

    var n = resourceSets[0].length + resourceSets[1].length;
    var lastPage = Math.ceil(n / 5) - 1;
    it('search by page initial call', fn(r, r.searchByPageInitial, [n, {}, "initial"]));

    describe('initial call links', function () {
        it('first', fn(r, r.searchByPage, [n, {}, 'initial', 'first', 0, null]));
        it('last', fn(r, r.searchByPage, [n, {}, 'initial', 'last', lastPage, null]));
        it('self', fn(r, r.searchByPage, [n, {}, 'initial', 'self', 0, 'page0']));
        it('next', fn(r, r.searchByPage, [n, {}, 'initial', 'next', 1, 'next0']));
        it('next verify', fn(r, r.searchByPage, [n, {}, 'next0', 'self', 1, null]));
    });

    describe('next transverse', function () {
        _.range(0, lastPage + 1).forEach(function (pageNo) {
            var pt = 'page' + pageNo;
            it(pt + ' link first', fn(r, r.searchByPage, [n, {}, pt, 'first', 0, null]));
            it(pt + ' link last', fn(r, r.searchByPage, [n, {}, pt, 'last', lastPage, null]));
            it(pt + ' link self', fn(r, r.searchByPage, [n, {}, pt, 'self', pageNo, null]));
            if (pageNo > 0) {
                it(pt + ' link prev', fn(r, r.searchByPage, [n, {}, pt, 'prev', pageNo - 1, null]));
            }
            if (pageNo < lastPage) {
                it(pt + ' link next', fn(r, r.searchByPage, [n, {}, pt, 'next', pageNo + 1, 'page' + (pageNo + 1)]));
            }
        });
    });

    after(fn(appw, appw.cleanUp));
});
