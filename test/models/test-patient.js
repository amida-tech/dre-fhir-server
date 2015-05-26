'use strict';

var util = require('util');

var chai = require('chai');
var _ = require('lodash');
var moment = require('moment');
var bbr = require('blue-button-record');

var model = require('../../models/patient');
var samples = require('../samples/patient-samples')();

var expect = chai.expect;

describe('models patient', function () {
    var shared = require('./shared')();

    before('connectDatabase', shared.connectDatabase('fhirpatientmodel'));

    var sample0Clone = _.cloneDeep(samples[0]);
    sample0Clone.birthDate = '1978-06-09';
    samples.push(sample0Clone);
    var moments = {
        start: moment()
    };

    var patients = {};

    var n = samples.length;

    it('create bad resource', shared.createBadResource(model));
    it('create db error simulation, saveSource', shared.createDbError(model, samples[0], 'saveSource'));
    it('create db error simulation, saveSection', shared.createDbError(model, samples[0], 'saveSection'));
    it('create db error simulation, patientKeyToId', shared.createDbError(model, samples[0], 'patientKeyToId'));

    it('create patient using update 0', shared.updateToCreate(model, samples[0], [], patients, moments));

    _.range(1, samples.length).forEach(function (i) {
        it('create patient ' + i, shared.create(model, samples[i], [], patients, moments));
    }, this);

    it('search (no param)', shared.search(model, null, patients, n));
    it('search (nor supported param)', shared.search(model, {
        unsupported: {
            value: "not"
        }
    }, patients, n));
    it('search db error simulation, search', shared.searchDbError(model, null, 'search'));

    _.range(samples.length).forEach(function (i) {
        it('search patient ' + i + ' by id', shared.searchById(model, samples[i], patients, 1));
    }, this);

    it('search by family and find 2', shared.search(model, {
        family: {
            value: samples[0].name[0].family[0]
        }
    }, patients, 2));
    it('search by family and find 1', shared.search(model, {
        family: {
            value: samples[1].name[0].family[0]
        }
    }, patients, 1));
    it('search by family and find none', shared.search(model, {
        family: {
            value: 'donotexist'
        }
    }, patients, 0));

    var birthDates = samples.map(function (sample) {
        return sample.birthDay;
    });
    birthDates.sort();
    var bbMiddleIndex = Math.floor(birthDates.length / 2);
    var bbMiddle = samples[bbMiddleIndex].birthDate;

    var bd = function (date, prefix) {
        return {
            birthDate: {
                value: date,
                type: 'date',
                prefix: prefix
            }
        };
    };

    it('search by birthDate not existing', shared.search(model, bd('1900-01-01', null), patients, 0));
    it('search by birthDate existing 1', shared.search(model, bd(bbMiddle, null), patients, 1));
    it('search by birthDate existing <', shared.search(model, bd(bbMiddle, '<'), patients, bbMiddleIndex));
    it('search by birthDate existing <=', shared.search(model, bd(bbMiddle, '<='), patients, bbMiddleIndex + 1));
    it('search by birthDate existing >', shared.search(model, bd(bbMiddle, '>'), patients, n - bbMiddleIndex - 1));
    it('search by birthDate existing >=', shared.search(model, bd(bbMiddle, '>='), patients, n - bbMiddleIndex));

    it('read invalid id', shared.readMissing(model, 'abc'));
    it('read valid id missing', shared.readMissing(model, '123456789012345678901234'));
    it('read db error simulation, idToPatientKey', shared.readDbError(model, samples[0], 'idToPatientKey'));
    it('read db error simulation, getEntry', shared.readDbError(model, samples[0], 'getEntry'));
    it('read db error simulation, entryToResource', shared.readGenFhirError(model, samples[0]));

    _.range(samples.length).forEach(function (i) {
        it('read for patient ' + i, shared.read(model, samples[i], moments, '1'));
    }, this);

    it('update bad resource', shared.updateBadResource(model, samples[0]));
    it('update invalid id', shared.updateInvalidId(model, samples[0], 'abc'));
    it('update db error simulation, idToPatientKey', shared.updateDbError(model, samples[0], 'idToPatientKey'));
    it('udpate db error simulation, saveSource', shared.updateDbError(model, samples[0], 'saveSource'));
    it('udpate db error simulation, replaceEntry', shared.updateDbError(model, samples[0], 'replaceEntry'));

    it('update local resource 0', function () {
        samples[0].gender = 'female';
    });

    it('update local resource 1', function () {
        samples[1].birthDate = "1981-11-11";
    });

    _.range(2).forEach(function (i) {
        it('detect updated patient ' + i + ' not equal db', shared.readNegative(model, samples[i]));
        it('update patient ' + i, shared.update(model, samples[i], moments, '2'));
        it('read updated patient ' + i, shared.read(model, samples[i], moments, '2'));
    }, this);

    it('delete invalid id', shared.deleteMissing(model, 'abc'));
    it('delete valid id missing', shared.deleteMissing(model, '123456789012345678901234'));
    it('delete db error simulation, idToPatientKey', shared.deleteDbError(model, samples[n - 1], 'idToPatientKey'));
    it('delete db error simulation, removeEntry', shared.deleteDbError(model, samples[n - 1], 'removeEntry'));

    it('refresh moment start', function () {
        moments.start = moment();
    });

    it('delete last patient', shared.delete(model, samples[n - 1]));
    it('delete next to last patient', shared.delete(model, samples[n - 2]));

    it('search (no param)', shared.search(model, null, patients, n - 2));

    it('update deleted last patient', shared.updateDeleted(model, samples[n - 1]));
    it('update deleted next to last patient', shared.updateDeleted(model, samples[n - 2]));

    it('read deleted for patient-0', shared.read(model, samples[n - 1], moments, '2', true));
    it('read deleted for patient-1', shared.read(model, samples[n - 2], moments, '2', true));

    after(shared.clearDatabase);
});

describe('models patient search by page', function () {
    var shared = require('./shared')({
        pageSize: 5
    });

    before('connectDatabase', shared.connectDatabase('fhirapatientmodelpage'));

    var samplesClone = _.flatten(_.times(4, function () {
        return _.cloneDeep(samples);
    }));

    var moments = {
        start: moment()
    };

    var patients = {};
    var patientIds = [];

    _.range(samplesClone.length).forEach(function (i) {
        it('create patient ' + i, shared.create(model, samplesClone[i], patientIds, patients, moments));
    });

    it('search paged first (no param)', shared.searchPagedFirst(model, null, patients, samplesClone.length, 's0'));

    _.range(5).forEach(function (pageNo) {
        var title = util.format('search page: %s (no param)', pageNo);
        it(title, shared.searchIdPage(model, patientIds, patients, samplesClone.length, 's0', pageNo));
    });

    after(shared.clearDatabase);
});
