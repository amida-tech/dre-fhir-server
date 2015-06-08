'use strict';

var util = require('util');

var chai = require('chai');
var moment = require('moment');
var bbr = require('blue-button-record');

var administrationModel = require('../../models/medicationAdministration');
var prescriptionModel = require('../../models/medicationPrescription');
var statementModel = require('../../models/medicationStatement');
var administrationSamples = require('../samples/medicationAdministration-samples');
var prescriptionSamples = require('../samples/medicationPrescription-samples');
var statementSamples = require('../samples/medicationStatement-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();
var _ = require('lodash');

var expect = chai.expect;

describe('models medicationAdministration', function () {
    var shared = require('./shared')({
        patientRefKey: 'patient'
    });

    before('connectDatabase', shared.connectDatabase('fhirmedicationadministrationmodel'));

    var administrationSamplesSet0 = administrationSamples.set0();
    var administrationSamplesSet1 = administrationSamples.set1();
    var linkedSet0 = administrationSamples.linkedSet0();
    var linkedSet1 = administrationSamples.linkedSet1();
    var prescriptionSamplesSet0 = prescriptionSamples.set0();
    var prescriptionSamplesSet1 = prescriptionSamples.set1();
    var statementSamplesSet0 = statementSamples.set0();
    var statementSamplesSet1 = statementSamples.set1();
    var moments = {
        start: moment()
    };

    var administrationMapById = {};
    var prescriptionMapById = {};
    var statementMapById = {};

    _.range(2).forEach(function (i) {
        it('create patient ' + i, shared.create(patientModel, patientSamples[i], [], {}, moments));
    }, this);

    it('assign patient-0 to linked prescription set-0', function () {
        shared.assignPatient(linkedSet0, patientSamples[0]);
    });

    it('assign patient-1 to linked prescription set-1', function () {
        shared.assignPatient(linkedSet1, patientSamples[1]);
    });

    _.range(linkedSet0.length).forEach(function (i) {
        it('create linked prescriptions for patient-0 ' + i, shared.create(prescriptionModel, linkedSet0[i], [], prescriptionMapById, moments));
    });

    _.range(linkedSet1.length).forEach(function (i) {
        it('create linked prescriptions for patient-1 ' + i, shared.create(prescriptionModel, linkedSet1[i], [], prescriptionMapById, moments));
    });

    it('assign linked prescriptions to administration set-0', shared.updateReferences(administrationSamplesSet0, 'prescription.reference', linkedSet0, 0));

    it('assign linked prescriptions to administration set-1', shared.updateReferences(administrationSamplesSet1, 'prescription.reference', linkedSet1, -3));

    it('assign patient-0 to administration set-0', function () {
        shared.assignPatient(administrationSamplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to administration set-1', function () {
        shared.assignPatient(administrationSamplesSet1, patientSamples[1]);
    });

    _.range(0, administrationSamplesSet0.length).forEach(function (i) {
        it('create administrations for patient-0 ' + i, shared.create(administrationModel, administrationSamplesSet0[i], [], administrationMapById, moments));
    });

    _.range(0, administrationSamplesSet1.length).forEach(function (i) {
        it('create administrations for patient-1 ' + i, shared.create(administrationModel, administrationSamplesSet1[i], [], administrationMapById, moments));
    });

    it('assign patient-0 to prescription set-0', function () {
        shared.assignPatient(prescriptionSamplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to prescription set-1', function () {
        shared.assignPatient(prescriptionSamplesSet1, patientSamples[1]);
    });

    _.range(0, prescriptionSamplesSet0.length).forEach(function (i) {
        it('create prescriptions for patient-0 ' + i, shared.create(prescriptionModel, prescriptionSamplesSet0[i], [], prescriptionMapById, moments));
    });

    _.range(0, prescriptionSamplesSet1.length).forEach(function (i) {
        it('create prescriptions for patient-1 ' + i, shared.create(prescriptionModel, prescriptionSamplesSet1[i], [], prescriptionMapById, moments));
    });

    it('assign patient-0 to statement set-0', function () {
        shared.assignPatient(statementSamplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to statement set-1', function () {
        shared.assignPatient(statementSamplesSet1, patientSamples[1]);
    });

    _.range(0, statementSamplesSet0.length).forEach(function (i) {
        it('create statements for patient-0 ' + i, shared.create(statementModel, statementSamplesSet0[i], [], statementMapById, moments));
    });

    _.range(0, statementSamplesSet1.length).forEach(function (i) {
        it('create statements for patient-1 ' + i, shared.create(statementModel, statementSamplesSet1[i], [], statementMapById, moments));
    });

    var countAdministration = administrationSamplesSet0.length + administrationSamplesSet1.length;
    it('search administrations (no param)', shared.search(administrationModel, null, administrationMapById, countAdministration));

    var countPrescription = prescriptionSamplesSet0.length + linkedSet0.length + prescriptionSamplesSet1.length + linkedSet1.length;
    it('search (no param)', shared.search(prescriptionModel, null, prescriptionMapById, countPrescription));

    var countStatement = statementSamplesSet0.length + statementSamplesSet1.length;
    it('search statements (no param)', shared.search(statementModel, null, statementMapById, countStatement));

    after(shared.clearDatabase);
});
