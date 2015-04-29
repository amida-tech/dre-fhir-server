'use strict';

var chai = require('chai');
var bbr = require('blue-button-record');

var model = require('../../models/observation');
var samples = require('../samples/observation-vital-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();
var _ = require('lodash');

var shared = require('./shared');

var expect = chai.expect;

describe('models observation vital', function () {
    before('connectDatabase', shared.connectDatabase('fhirobservationvitalmodel'));

    var samplesSet0 = samples.set0();
    var samplesSet1 = samples.set1();

    it('detect missing patient', shared.detectMissingPatient(model, samplesSet0[0]));

    _.range(2).forEach(function (i) {
        it('create patient ' + i, shared.create(patientModel, patientSamples[i], [], {}));
    }, this);

    it('assign patient-0 to sample set-0', function () {
        shared.assignPatient(samplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to sample set-1', function () {
        shared.assignPatient(samplesSet1, patientSamples[1]);
    });

    var entryMapById = {};
    var entryIds = [];

    var populatePanelIt = function (samplesSet, index, offset) {
        return function () {
            var obsSample = samplesSet[index];
            obsSample.related.forEach(function (related) {
                var index = related.target.reference;
                related.target.reference = entryIds[index + offset];
            });
        };
    };

    _.range(samples.panelStart0).forEach(function (i) {
        it('create for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById));
    });

    _.range(samples.panelStart0, samplesSet0.length).forEach(function (i) {
        it('populate panel for patient-0 ' + i, populatePanelIt(samplesSet0, i, 0));
        it('create panel for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById));
    });

    _.range(samples.panelStart1).forEach(function (i) {
        it('create for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById));
    });

    _.range(samples.panelStart1, samplesSet1.length).forEach(function (i) {
        it('populate panel for patient-1 ' + i, populatePanelIt(samplesSet1, i, 0));
        it('create panel for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById));
    });

    it('search (no param)', shared.search(model, null, entryMapById, samplesSet0.length + samplesSet1.length));

    _.range(samplesSet0.length).forEach(function (i) {
        it('search by id for patient-0 ' + i, shared.searchById(model, samplesSet0[i], entryMapById, 1));
    });

    _.range(samplesSet1.length).forEach(function (i) {
        it('search by id for patient-1 ' + i, shared.searchById(model, samplesSet1[i], entryMapById, 1));
    });

    it('search not existing id', shared.searchById(model, null, entryMapById, 0));

    it('search by patient-0', shared.searchByPatient(model, patientSamples[0], entryMapById, samplesSet0.length));
    it('search by patient-1', shared.searchByPatient(model, patientSamples[1], entryMapById, samplesSet1.length));

    _.range(samplesSet0.length).forEach(function (i) {
        it('read for patient-0 ' + i, shared.read(model, samplesSet0[i]));
    });

    _.range(samplesSet1.length).forEach(function (i) {
        it('read for patient-1 ' + i, shared.read(model, samplesSet1[i]));
    });

    it('update values', function () {
        samplesSet0[0].valueQuantity.value += 1;
        samplesSet1[0].valueQuantity.value += 1;
    });

    it('detect updated not equal db for patient-0', shared.readNegative(model, samplesSet0[0]));
    it('update for patient-0', shared.update(model, samplesSet0[0]));
    it('read updated for patient-0', shared.read(model, samplesSet0[0]));
    it('detect updated not equal db for patient-1', shared.readNegative(model, samplesSet1[0]));
    it('update for patient-1', shared.update(model, samplesSet1[0]));
    it('read updated for patient-1', shared.read(model, samplesSet1[0]));

    var n0 = samplesSet0.length - 1;
    var n1 = samplesSet1.length - 1;

    it('delete last for patient-0', shared.delete(model, samplesSet0[n0]));
    it('delete last for patient-1', shared.delete(model, samplesSet1[n1]));

    it('search (no param)', shared.search(model, null, entryMapById, n0 + n1));

    after(shared.clearDatabase);
});
