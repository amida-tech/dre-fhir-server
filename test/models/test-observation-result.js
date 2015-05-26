'use strict';

var util = require('util');

var chai = require('chai');
var moment = require('moment');
var bbr = require('blue-button-record');

var model = require('../../models/observation');
var samples = require('../samples/observation-result-samples');
var patientModel = require('../../models/patient');
var patientSamples = require('../samples/patient-samples')();
var _ = require('lodash');

var expect = chai.expect;

describe('models observation result', function () {
    var shared = require('./shared')({
        patientRefKey: 'subject'
    });

    before('connectDatabase', shared.connectDatabase('fhirobservationresultmodel'));

    var samplesSet0 = samples.set0();
    var samplesSet1 = samples.set1();
    var moments = {
        start: moment()
    };

    it('detect missing patient', shared.detectMissingPatient(model, samplesSet0[0]));
    it('detect missing patient for update', shared.detectMissingPatientForUpdate(model, samplesSet0[0]));

    _.range(2).forEach(function (i) {
        it('create patient ' + i, shared.create(patientModel, patientSamples[i], [], {}, moments));
    }, this);

    it('assign patient-0 to sample set-0', function () {
        shared.assignPatient(samplesSet0, patientSamples[0]);
    });

    it('assign patient-1 to sample set-1', function () {
        shared.assignPatient(samplesSet1, patientSamples[1]);
    });

    it('create bad resource', shared.createBadResource(model));
    it('create db error simulation, saveSource', shared.createDbError(model, samplesSet0[0], 'saveSource'));
    it('create db error simulation, saveSource', shared.createDbError(model, samplesSet0[0], 'saveSection'));
    it('create db error simulation, idToPatientKey', shared.createDbError(model, samplesSet0[0], 'idToPatientKey'));
    it('create invalid id', shared.createBadPatientId(model, samplesSet0[0], 'abc'));
    it('create valid id missing', shared.createBadPatientId(model, samplesSet0[0], '123456789012345678901234'));

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

    it('create for patient-0 using update 0', shared.updateToCreate(model, samplesSet0[0], entryIds, entryMapById, moments));

    _.range(1, samples.panelStart0).forEach(function (i) {
        it('create for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById, moments));
    });

    _.range(samples.panelStart0, samplesSet0.length).forEach(function (i) {
        it('populate panel for patient-0 ' + i, populatePanelIt(samplesSet0, i, 0));
        it('create panel for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById, moments));
    });

    it('create for patient-1 using update 0', shared.updateToCreate(model, samplesSet1[0], entryIds, entryMapById, moments));

    _.range(1, samples.panelStart1).forEach(function (i) {
        it('create for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById, moments));
    });

    _.range(samples.panelStart1, samplesSet1.length).forEach(function (i) {
        it('populate panel for patient-1 ' + i, populatePanelIt(samplesSet1, i, 0));
        it('create panel for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById, moments));
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

    it('read invalid id', shared.readMissing(model, 'abc'));
    it('read valid id missing', shared.readMissing(model, '123456789012345678901234'));
    it('read db error simulation, idToPatientKey', shared.readDbError(model, samplesSet0[0], 'idToPatientKey'));
    it('read db error simulation, getEntry', shared.readDbError(model, samplesSet0[0], 'getEntry'));
    it('read db error simulation, entryToResource', shared.readGenFhirError(model, samplesSet0[0]));
    it('read db error simulation, idToPatientKey (2)', shared.readDbError(model, samplesSet0[0], 'idToPatientKey', function (secName) {
        if (secName === 'vitals') {
            arguments[arguments.length - 1](null, null);
        } else {
            arguments[arguments.length - 1](new Error('idToPatientKey'));
        }
    }));

    _.range(samplesSet0.length).forEach(function (i) {
        it('read for patient-0 ' + i, shared.read(model, samplesSet0[i], moments, '1'));
    });

    _.range(samplesSet1.length).forEach(function (i) {
        it('read for patient-1 ' + i, shared.read(model, samplesSet1[i], moments, '1'));
    });

    it('update bad resource', shared.updateBadResource(model, samplesSet0[0]));
    it('update invalid id', shared.updateInvalidId(model, samplesSet0[0], 'abc'));
    it('update db error simulation, idToPatientKey', shared.updateDbError(model, samplesSet0[0], 'idToPatientKey'));
    it('udpate db error simulation, saveSource', shared.updateDbError(model, samplesSet0[0], 'saveSource'));
    it('udpate db error simulation, replaceEntry', shared.updateDbError(model, samplesSet0[0], 'replaceEntry'));

    it('update values', function () {
        samplesSet0[0].valueQuantity.value += 1;
        samplesSet1[0].valueQuantity.value += 1;
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
    it('delete db error simulation, idToPatientkey', shared.deleteDbError(model, samplesSet0[n0], 'idToPatientKey'));

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

describe('models observation-result search by page', function () {
    var shared = require('./shared')({
        patientRefKey: 'subject',
        pageSize: 5
    });

    before('connectDatabase', shared.connectDatabase('fhirobservationresultmodelpage'));

    var samplesSet0Base = samples.set0();
    var samplesSet0 = _.flatten(_.times(4, function (index) {
        var clone = _.cloneDeep(samplesSet0Base);
        if (index > 0) {
            var offset = index * samplesSet0Base.length;
            clone.forEach(function (obs) {
                if (obs.related) {
                    obs.related.forEach(function (r) {
                        r.target.reference += offset;
                    });
                }
            });
        }
        return clone;
    }));
    var samplesSet1Base = samples.set1();
    var samplesSet1 = _.flatten(_.times(4, function (index) {
        var clone = _.cloneDeep(samplesSet1Base);
        if (index > 0) {
            var offset = index * samplesSet1Base.length;
            clone.forEach(function (obs) {
                if (obs.related) {
                    obs.related.forEach(function (r) {
                        r.target.reference += offset;
                    });
                }
            });
        }
        return clone;
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

    var populatePanel = function (sample, entryIds, offset) {
        sample.related.forEach(function (related) {
            var index = related.target.reference;
            related.target.reference = entryIds[index + offset];
        });
    };

    _.range(0, samplesSet0.length).forEach(function (i) {
        if (samplesSet0[i].related) {
            it('populate panel for patient-0 ' + i, function () {
                populatePanel(samplesSet0[i], entryIds, 0);
            });
        }
        it('create for patient-0 ' + i, shared.create(model, samplesSet0[i], entryIds, entryMapById, moments));
    });

    _.range(0, samplesSet1.length).forEach(function (i) {
        if (samplesSet1[i].related) {
            it('populate panel for patient-1 ' + i, function () {
                populatePanel(samplesSet1[i], entryIds, samplesSet0.length);
            });
        }

        it('create for patient-1 ' + i, shared.create(model, samplesSet1[i], entryIds, entryMapById, moments));
    });

    it('search paged first (no param)', shared.searchPagedFirst(model, null, entryMapById, samplesSet0.length + samplesSet1.length, 's0'));

    _.range(5).forEach(function (pageNo) {
        var title = util.format('search page: %s (no param)', pageNo);
        it(title, shared.searchIdPage(model, entryIds, entryMapById, samplesSet0.length + samplesSet1.length, 's0', pageNo));
    });

    after(shared.clearDatabase);
});
