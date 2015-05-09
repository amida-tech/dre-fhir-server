'use strict';

var request = require('supertest');
var chai = require('chai');
var _ = require('lodash');

var expect = chai.expect;
var fhirApp = require('../../config/app');
var samples = require('../samples/allergyIntolerance-samples');
var patientSamples = require('../samples/patient-samples')();
var sharedMod = require('./shared');
var appWrap = require('./app-wrap');

var itFn = function (obj, fn, args) {
    return function (done) {
        var fnArgs = args ? args.concat([done]) : [done];
        fn.apply(obj, fnArgs);
    };
};

describe('routes allergyIntolerance', function () {
    var app = appWrap.instance('fhirallergyintoleranceapi');
    var shared = sharedMod({
        app: app,
        resourceType: 'AllergyIntolerance',
        readTransform: function (resource) {
            delete resource.patient.display;
        }
    });
    var sharedPatient = sharedMod({
        app: app,
        resourceType: 'Patient'
    });

    var samplesSet0 = samples.set0();
    var samplesSet1 = samples.set1();

    var mgr = shared.sampleSetAdapter([samplesSet0, samplesSet1]);
    var ptMgr = sharedPatient.sampleSetAdapter([patientSamples]);

    before(itFn(app, app.start));

    it('check config (inits database as well)', itFn(shared, shared.getConfig));

    it('clear database', itFn(app, app.cleardb));

    it('create with patient missing', itFn(mgr, mgr.createNegative, [0, 0]));

    for (var i = 0; i < 2; ++i) {
        it('create patient ' + i, itFn(ptMgr, ptMgr.create, [0, i]));
    }

    it('assign patients to samples', function () {
        [samplesSet0, samplesSet1].forEach(function (samplesSet, index) {
            var reference = patientSamples[index].id;
            samplesSet.forEach(function (sample) {
                sample.patient = {
                    reference: reference
                };
            });
        });
    });

    for (var j0 = 0; j0 < samplesSet0.length; ++j0) {
        it('create for patient-0 ' + j0, itFn(mgr, mgr.create, [0, j0]));
    }

    for (var j1 = 0; j1 < samplesSet1.length; ++j1) {
        it('create for patient-1 ' + j1, itFn(mgr, mgr.create, [1, j1]));
    }

    var n = samplesSet0.length + samplesSet1.length;
    it('search (get - no param)', itFn(shared, shared.search, [n, {}]));
    it('search (post - no param)', itFn(shared, shared.searchByPost, [n, {}]));

    for (var k0 = 0; k0 < samplesSet0.length; ++k0) {
        it('read for patient-0 ' + k0, itFn(mgr, mgr.read, [0, k0]));
    }

    for (var k1 = 0; k1 < samplesSet0.length; ++k1) {
        it('read for patient-1 ' + k1, itFn(mgr, mgr.read, [1, k1]));
    }

    it('update values', function () {
        samplesSet0[0].recordedDate = '2002-01-01';
        samplesSet1[0].recordedDate = '2003-05-05';
    });

    it('detect updated not equal db for patient-0', itFn(mgr, mgr.readNegative, [0, 0]));
    it('update for patient-0', itFn(mgr, mgr.update, [0, 0]));
    it('read for patient-0', itFn(mgr, mgr.read, [0, 0]));
    it('detect updated not equal db for patient-1', itFn(mgr, mgr.readNegative, [1, 0]));
    it('update for patient-1', itFn(mgr, mgr.update, [1, 0]));
    it('read for patient-1', itFn(mgr, mgr.read, [1, 0]));

    var n0 = samplesSet0.length - 1;
    var n1 = samplesSet1.length - 1;

    it('delete last for patient-0', itFn(mgr, mgr.delete, [0, n0]));
    it('delete last for patient-1', itFn(mgr, mgr.delete, [1, n1]));

    it('search (no param)', itFn(shared, shared.search, [n0 + n1, {}]));

    after(itFn(app, app.cleanUp));
});
