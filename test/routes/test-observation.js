'use strict';

var util = require('util');
var _ = require('lodash');

var vitalSamples = require('../samples/observation-vital-samples');
var resultSamples = require('../samples/observation-result-samples');
var patientSamples = require('../samples/patient-samples')();
var supertestWrap = require('./supertest-wrap');
var appWrap = require('./app-wrap');
var common = require('./common');

var fn = common.generateTestItem;
var fnId = common.searchById;
var fnPt = common.searchByPatient;

var resourceType = 'Observation';
var testTitle = util.format('%s routes', resourceType);
var patientProperty = 'subject';

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

    var resourceSets = [vitalSamples.set0(), vitalSamples.set1(), resultSamples.set0(), resultSamples.set1()];
    resourceSets[0].panelStart = vitalSamples.panelStart0;
    resourceSets[1].panelStart = vitalSamples.panelStart1;
    resourceSets[2].panelStart = resultSamples.panelStart0;
    resourceSets[3].panelStart = resultSamples.panelStart1;

    var nSets = resourceSets.length;

    before(fn(appw, appw.start));

    it('check config (inits database as well)', fn(r, r.config));

    it('clear database', fn(appw, appw.cleardb));

    it('fail to create resource 0 for patient 0 with patient ref missing', fn(r, r.createNegative, resourceSets[0][0]));

    _.range(nSets).forEach(function (index) {
        var title = util.format('create patient %s', index);
        it(title, fn(pt, pt.create, [patientSamples[index]]));
    }, this);

    it('assign patient refs to all resources', function () {
        common.putPatientRefs(resourceSets, patientSamples, patientProperty);
    });

    _.range(nSets).forEach(function (i) {
        _.range(resourceSets[i].panelStart).forEach(function (j) {
            var title = util.format('create resource %s for patient %s', j, i);
            it(title, fn(r, r.create, resourceSets[i][j]));
        }, this);
    }, this);

    it('populate resource panel element ids', function () {
        common.putPanelElementRefs(resourceSets);
    });

    _.range(nSets).forEach(function (i) {
        _.range(resourceSets[i].panelStart, resourceSets[i].length).forEach(function (j) {
            var title = util.format('create resource (panel) %s for patient %s', j, i);
            it(title, fn(r, r.create, resourceSets[i][j]));
        }, this);
    }, this);

    var n = resourceSets.reduce(function (r, resources) {
        return r + resources.length;
    }, 0);
    it('search all using get', fn(r, r.search, [n, {}]));
    it('search all using post', fn(r, r.searchByPost, [n, {}]));

    it('search not existing id', fn(r, r.search, [0, {
        _id: '123456789012345678901234'
    }]));

    _.range(nSets).forEach(function (i) {
        _.range(resourceSets[i].length).forEach(function (j) {
            var title = util.format('search by id resource %s for patient %s', j, i);
            it(title, fnId(r, r.search, resourceSets[i][j]));
        }, this);
    }, this);

    _.range(nSets).forEach(function (i) {
        var title = util.format('search by patient %s', i);
        it(title, fnPt(r, r.search, patientSamples[i], patientProperty, resourceSets[i].length));
    }, this);

    it('read missing (invalid id)', fn(r, r.readMissing, 'abc'));
    it('read missing (valid id)', fn(r, r.readMissing, '123456789012345678901234'));

    _.range(nSets).forEach(function (i) {
        _.range(resourceSets[i].length).forEach(function (j) {
            var title = util.format('read resource %s for patient %s', j, i);
            it(title, fn(r, r.read, resourceSets[i][j]));
        }, this);
    }, this);

    it('update missing (invalid id)', fn(r, r.updateMissing, [resourceSets[0][0], 'abc']));
    it('udpate missing (valid id)', fn(r, r.updateMissing, [resourceSets[0][0], '123456789012345678901234']));

    _.range(nSets).forEach(function (i) {
        it(util.format('update local resource 0 for patient %s', i), function () {
            resourceSets[i][0].valueQuantity.value += 1;
        });
    }, this);

    _.range(nSets).forEach(function (i) {
        var ptTitle = util.format(' for patient %s', i);
        it('detect resource 0 not on server' + ptTitle, fn(r, r.readNegative, resourceSets[i][0]));
        it('update resource 0' + ptTitle, fn(r, r.update, resourceSets[i][0]));
        it('read resource 0' + ptTitle, fn(r, r.read, resourceSets[i][0]));
    }, this);

    it('delete missing (invalid id)', fn(r, r.deleteMissing, 'abc'));
    it('delete missing (valid id)', fn(r, r.deleteMissing, '123456789012345678901234'));

    _.range(nSets).forEach(function (i) {
        var nLast = resourceSets[i].length - 1;
        var title = util.format('delete last resource for patient %s', i);
        it(title, fn(r, r.delete, resourceSets[i][nLast]));
    }, this);

    it('search all using get', fn(r, r.search, [n - 4, {}]));

    after(fn(appw, appw.cleanUp));
});
