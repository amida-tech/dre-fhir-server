'use strict';

var _ = require('lodash');

var samples = require('../samples/allergyIntolerance-samples');
var patientSamples = require('../samples/patient-samples')();
var str = require('./supertest-resource');
var appWrap = require('./app-wrap');
var common = require('./common');

var itFn = common.generateTestItem;

describe('routes allergyIntolerance', function () {
    var app = appWrap.instance('fhirallergyintoleranceapi');
    var stri = str({
        app: app,
        resourceType: 'AllergyIntolerance',
        readTransform: function (resource) {
            delete resource.patient.display;
        }
    });
    var ptStri = str({
        app: app,
        resourceType: 'Patient'
    });

    var samplesSets = [samples.set0(), samples.set1()];

    before(itFn(app, app.start));

    it('check config (inits database as well)', itFn(stri, stri.getConfig));

    it('clear database', itFn(app, app.cleardb));

    it('create with patient missing', itFn(stri, stri.createNegative, samplesSets[0][0]));

    _.range(2).forEach(function (index) {
        it('create patient ' + index, itFn(ptStri, ptStri.create, [patientSamples[index]]));
    }, this);

    it('assign patients to samples', function () {
        common.putPatientRefs(samplesSets, patientSamples, 'patient');
    });

    _.range(2).forEach(function (i) {
        _.range(samplesSets[i].length).forEach(function (j) {
            it('create for patient-' + i + ' ' + j, itFn(stri, stri.create, samplesSets[i][j]));
        }, this);
    }, this);

    var n = samplesSets[0].length + samplesSets[1].length;
    it('search (get - no param)', itFn(stri, stri.search, [n, {}]));
    it('search (post - no param)', itFn(stri, stri.searchByPost, [n, {}]));

    _.range(2).forEach(function (i) {
        _.range(samplesSets[i].length).forEach(function (j) {
            it('read for patient-' + i + ' ' + j, itFn(stri, stri.read, samplesSets[i][j]));
        }, this);
    }, this);

    it('update values', function () {
        samplesSets[0][0].recordedDate = '2002-01-01';
        samplesSets[1][0].recordedDate = '2003-05-05';
    });

    _.range(2).forEach(function (i) {
        it('detect updated not equal db for patient-' + i, itFn(stri, stri.readNegative, samplesSets[i][0]));
        it('update for patient-' + i, itFn(stri, stri.update, samplesSets[i][0]));
        it('read for patient-' + i, itFn(stri, stri.read, samplesSets[i][0]));
    }, this);

    var n0 = samplesSets[0].length - 1;
    var n1 = samplesSets[1].length - 1;

    it('delete last for patient-0', itFn(stri, stri.delete, samplesSets[0][n0]));
    it('delete last for patient-1', itFn(stri, stri.delete, samplesSets[1][n1]));

    it('search (no param)', itFn(stri, stri.search, [n0 + n1, {}]));

    after(itFn(app, app.cleanUp));
});
