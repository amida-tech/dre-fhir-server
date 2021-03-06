'use strict';

var util = require('util');

var chai = require('chai');
var moment = require('moment');
var bbr = require('blue-button-record');

var model = require('../../models/medicationAdministration');
var modelPrescription = require('../../models/medicationPrescription');
var samples = require('../samples/medicationAdministration-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();
var _ = require('lodash');

var expect = chai.expect;

describe('models medicationAdministration', function () {
    var shared = require('./shared')({
        patientRefKey: 'patient'
    });

    before('connectDatabase', shared.connectDatabase('fhirmedicationadministrationmodel'));

    var samplesSet0 = samples.set0();
    var samplesSet1 = samples.set1();
    var linkedSet0 = samples.linkedSet0();
    var linkedSet1 = samples.linkedSet1();
    var moments = {
        start: moment()
    };

    var prescriptionlessSample = (function () {
        var clone = _.cloneDeep(samplesSet0[0]);
        delete clone.prescription;
        return clone;
    })();
    it('detect missing prescription', shared.detectCreateError(model, prescriptionlessSample, 'createMedPrescriptionMissing'));
    it('detect invalid prescription', shared.detectCreateError(model, samplesSet0[0], 'readMissing'));

    _.range(2).forEach(function (i) {
        it('create patient ' + i, shared.create(patientModel, patientSamples[i], [], {}, moments));
    }, this);

    it('assign patient-0 to prescription set-0', function () {
        shared.assignPatient(linkedSet0, patientSamples[0]);
    });

    it('assign patient-1 to prescription set-1', function () {
        shared.assignPatient(linkedSet1, patientSamples[1]);
    });

    var linkedEntryMapById = {};

    _.range(linkedSet0.length).forEach(function (i) {
        it('create prescriptions for patient-0 ' + i, shared.create(modelPrescription, linkedSet0[i], [], linkedEntryMapById, moments));
    });

    _.range(linkedSet1.length).forEach(function (i) {
        it('create prescriptions for patient-1 ' + i, shared.create(modelPrescription, linkedSet1[i], [], linkedEntryMapById, moments));
    });

    it('assign prescriptions to set-0', shared.updateReferences(samplesSet0, 'prescription.reference', linkedSet0, 0));

    it('assign prescriptions to set-1', shared.updateReferences(samplesSet1, 'prescription.reference', linkedSet1, -3));

    it('detect missing patient for create', shared.detectCreateError(model, samplesSet0[0], 'createPatientMissing'));
    it('detect missing patient for update', shared.detectMissingPatientForUpdate(model, samplesSet0[0]));

    it('assign patient-0 to sample set-0', function () {
        shared.assignPatient(samplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to sample set-1', function () {
        shared.assignPatient(samplesSet1, patientSamples[1]);
    });

    it('create bad resource', shared.createBBFhirError(model, samplesSet0[0]));
    it('create db error simulation, saveSource', shared.createDbError(model, samplesSet0[0], 'saveSource'));
    it('create db error simulation, saveSource', shared.createDbError(model, samplesSet0[0], 'saveSection'));
    it('create db error simulation, idToPatientKey', shared.createDbError(model, samplesSet0[0], 'idToPatientKey'));
    it('create invalid id', shared.createBadPatientId(model, samplesSet0[0], 'abc'));
    it('create valid id missing', shared.createBadPatientId(model, samplesSet0[0], '123456789012345678901234'));

    var entryMapById = {};
    var entryIds = [];

    it('create for patient-0 using update 0', shared.updateToCreate(model, samplesSet0[0], entryIds, entryMapById, moments));

    _.range(1, samplesSet0.length).forEach(function (i) {
        it('create for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById, moments));
    });

    it('create for patient-1 using update 0', shared.updateToCreate(model, samplesSet1[0], entryIds, entryMapById, moments));

    _.range(1, samplesSet1.length).forEach(function (i) {
        it('create for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById, moments));
    });

    it('search (no param)', shared.search(model, null, entryMapById, samplesSet0.length + samplesSet1.length));
    it('search db error simulation, search', shared.searchDbError(model, null, 'search'));

    _.range(samplesSet0.length).forEach(function (i) {
        it('search by id for patient-0 ' + i, shared.searchById(model, samplesSet0[i], entryMapById, 1));
    });

    _.range(samplesSet1.length).forEach(function (i) {
        it('search by id for patient-1 ' + i, shared.searchById(model, samplesSet1[i], entryMapById, 1));
    });

    it('search not existing id', shared.searchById(model, null, entryMapById, 0));

    it('search by missing patient (invalid id)', shared.searchByMissingPatient(model, 'abc', entryMapById));
    it('search by missing patient (valid id)', shared.searchByMissingPatient(model, '123456789012345678901234', entryMapById));
    it('search by patient db error, idToPatientKey', shared.searchByPatientDbError(model, patientSamples[0], 'idToPatientKey'));
    it('search by patient-0', shared.searchByPatient(model, patientSamples[0], entryMapById, samplesSet0.length));
    it('search by patient-1', shared.searchByPatient(model, patientSamples[1], entryMapById, samplesSet1.length));

    it('search prescriptions by patient-0', shared.searchByPatient(modelPrescription, patientSamples[0], linkedEntryMapById, linkedSet0.length));
    it('search prescriptions by patient-1', shared.searchByPatient(modelPrescription, patientSamples[1], linkedEntryMapById, linkedSet1.length));

    it('read invalid id', shared.readMissing(model, 'abc'));
    it('read valid id missing', shared.readMissing(model, '123456789012345678901234'));
    it('read db error simulation, idToPatientInfo', shared.readDbError(model, samplesSet0[0], 'idToPatientInfo'));
    it('read db error simulation, getEntry', shared.readDbError(model, samplesSet0[0], 'getEntry'));
    it('read db error simulation, entryToResource', shared.readGenFhirError(model, samplesSet0[0]));

    _.range(samplesSet0.length).forEach(function (i) {
        it('read for patient-0 ' + i, shared.read(model, samplesSet0[i], moments, '1'));
    });

    _.range(samplesSet1.length).forEach(function (i) {
        it('read for patient-1 ' + i, shared.read(model, samplesSet1[i], moments, '1'));
    });

    //it('update bad resource', shared.updateBadResource(model, samplesSet0[0]));
    it('update invalid id', shared.updateInvalidId(model, samplesSet0[0], 'abc'));
    it('update db error simulation, idToPatientKey', shared.updateDbError(model, samplesSet0[0], 'idToPatientKey'));
    it('udpate db error simulation, saveSource', shared.updateDbError(model, samplesSet0[0], 'saveSource'));
    it('udpate db error simulation, replaceEntry', shared.updateDbError(model, samplesSet0[0], 'replaceEntry'));

    it('update values', function () {
        samplesSet0[0].effectiveTimePeriod.start = '2012-07-06';
        samplesSet1[0].effectiveTimePeriod.end = '2012-07-13';
    });

    it('detect updated not equal db for patient-0', shared.readNegative(model, samplesSet0[0]));
    it('update for patient-0', shared.update(model, samplesSet0[0], moments, '2'));
    it('read updated for patient-0', shared.read(model, samplesSet0[0], moments, '2'));
    it('detect updated not equal db for patient-1', shared.readNegative(model, samplesSet1[0]));
    it('update for patient-1', shared.update(model, samplesSet1[0], moments, '2'));
    it('read updated for patient-1', shared.read(model, samplesSet1[0], moments, '2'));

    var n0 = samplesSet0.length - 1;
    var n1 = samplesSet1.length - 1;

    it('delete invalid id', shared.deleteMissing(model, 'abc'));
    it('delete valid id missing', shared.deleteMissing(model, '123456789012345678901234'));
    it('delete db error simulation, idToPatientKey', shared.deleteDbError(model, samplesSet0[n0], 'idToPatientKey'));
    it('delete db error simulation, removeEntry', shared.deleteDbError(model, samplesSet0[n0], 'removeEntry'));

    it('refresh moment start', function () {
        moments.start = moment();
    });

    it('delete last for patient-0', shared.delete(model, samplesSet0[n0]));
    it('delete last for patient-1', shared.delete(model, samplesSet1[n1]));

    it('search (no param)', shared.search(model, null, entryMapById, n0 + n1));

    it('update deleted for patient-0', shared.updateDeleted(model, samplesSet0[n0]));
    it('update deleted for patient-1', shared.updateDeleted(model, samplesSet1[n1]));

    it('read deleted for patient-0', shared.read(model, samplesSet0[n0], moments, '2', true));
    it('read deleted for patient-1', shared.read(model, samplesSet1[n1], moments, '2', true));

    after(shared.clearDatabase);
});

describe('models medication administration search by page', function () {
    var shared = require('./shared')({
        patientRefKey: 'patient',
        pageSize: 5
    });

    before('connectDatabase', shared.connectDatabase('fhirmedicationadministrationpage'));

    var samplesSet0Base = samples.set0();
    var samplesSet0 = _.flatten(_.times(4, function () {
        return _.cloneDeep(samplesSet0Base);
    }));
    var samplesSet1Base = samples.set1();
    var samplesSet1 = _.flatten(_.times(4, function () {
        return _.cloneDeep(samplesSet1Base);
    }));
    var linkedSet0Base = samples.linkedSet0();
    var linkedSet0 = _.flatten(_.times(4, function () {
        return _.cloneDeep(linkedSet0Base);
    }));
    var linkedSet1Base = samples.linkedSet1();
    var linkedSet1 = _.flatten(_.times(4, function () {
        return _.cloneDeep(linkedSet1Base);
    }));
    var moments = {
        start: moment()
    };

    _.range(2).forEach(function (i) {
        it('create patient ' + i, shared.create(patientModel, patientSamples[i], [], {}, moments));
    }, this);

    it('assign patient-0 to prescription set-0', function () {
        shared.assignPatient(linkedSet0, patientSamples[0]);
    });

    it('assign patient-1 to prescription set-1', function () {
        shared.assignPatient(linkedSet1, patientSamples[1]);
    });

    var linkedEntryMapById = {};

    _.range(linkedSet0.length).forEach(function (i) {
        it('create prescriptions for patient-0 ' + i, shared.create(modelPrescription, linkedSet0[i], [], linkedEntryMapById, moments));
    });

    _.range(linkedSet1.length).forEach(function (i) {
        it('create prescriptions for patient-1 ' + i, shared.create(modelPrescription, linkedSet1[i], [], linkedEntryMapById, moments));
    });

    it('assign prescriptions to set-0', shared.updateReferences(samplesSet0, 'prescription.reference', linkedSet0, 0));

    it('assign prescriptions to set-1', shared.updateReferences(samplesSet1, 'prescription.reference', linkedSet1, -3));

    it('assign patient-0 to sample set-0', function () {
        shared.assignPatient(samplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to sample set-1', function () {
        shared.assignPatient(samplesSet1, patientSamples[1]);
    });

    var entryMapById = {};
    var entryIds = [];

    _.range(samplesSet0.length).forEach(function (i) {
        it('create for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById, moments));
    });

    _.range(samplesSet1.length).forEach(function (i) {
        it('create for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById, moments));
    });

    it('search paged first (no param)', shared.searchPagedFirst(model, null, entryMapById, samplesSet0.length + samplesSet1.length, 's0'));

    _.range(5).forEach(function (pageNo) {
        var title = util.format('search page: %s (no param)', pageNo);
        it(title, shared.searchIdPage(model, entryIds, entryMapById, samplesSet0.length + samplesSet1.length, 's0', pageNo));
    });

    after(shared.clearDatabase);
});
