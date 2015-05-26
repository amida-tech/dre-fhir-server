'use strict';

var chai = require('chai');
var moment = require('moment');
var bbr = require('blue-button-record');
var util = require('util');

var model = require('../../models/allergyIntolerance');
var samples = require('../samples/allergyIntolerance-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();
var _ = require('lodash');

var shared = require('./shared')({
    patientRefKey: 'patient',
    pageSize: 5
});

var expect = chai.expect;

describe('models search paging', function () {
    before('connectDatabase', shared.connectDatabase('fhirallergyintolerancemodel'));

    var samplesSet0Base = samples.set0();
    var samplesSet0 = _.flatten(_.times(4, function () {
        return _.cloneDeep(samplesSet0Base);
    }));
    var samplesSet1Base = samples.set1();
    var samplesSet1 = _.flatten(_.times(4, function () {
        return _.cloneDeep(samplesSet1Base);
    }));

    var moments = {
        start: moment()
    };

    _.range(2).forEach(function (i) {
        it('create patient ' + i, shared.create(patientModel, patientSamples[i], [], {}, moments));
    }, this);

    it('assign patient-0 to sample set-0', function () {
        shared.assignPatient(samplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to sample set-1', function () {
        shared.assignPatient(samplesSet1, patientSamples[1]);
    });

    var entryMapById = {};
    var entryIds = [];

    _.range(0, samplesSet0.length).forEach(function (i) {
        it('create for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById, moments));
    });

    _.range(0, samplesSet1.length).forEach(function (i) {
        it('create for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById, moments));
    });

    it('search paged first (no param)', shared.searchPagedFirst(model, null, entryMapById, samplesSet0.length + samplesSet1.length, 's0'));

    _.range(5).forEach(function (pageNo) {
        var title = util.format('search page: %s (no param)', pageNo);
        it(title, shared.searchIdPage(model, entryIds, entryMapById, samplesSet0.length + samplesSet1.length, 's0', pageNo));
    });

    after(shared.clearDatabase);
});
