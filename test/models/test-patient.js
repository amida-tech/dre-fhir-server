'use strict';

var chai = require('chai');
var _ = require('lodash');
var bbr = require('blue-button-record');

var model = require('../../models/patient');
var samples = require('../samples/patient-samples')();

var shared = require('./shared')();

var expect = chai.expect;

describe('models patient', function () {
    before('connectDatabase', shared.connectDatabase('fhirpatientmodel'));

    var sample0Clone = _.cloneDeep(samples[0]);
    sample0Clone.birthDate = '1978-06-09';
    samples.push(sample0Clone);

    var patients = {};

    var n = samples.length;

    _.range(samples.length).forEach(function (i) {
        it('create patient ' + i, shared.create(model, samples[i], [], patients));
    }, this);

    it('search (no param)', shared.search(model, null, patients, n));

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

    _.range(samples.length).forEach(function (i) {
        it('read for patient ' + i, shared.read(model, samples[i]));
    }, this);

    it('update bad resource', shared.updateBadResource(model, samples[0]));
    it('update invalid id', shared.updateMissing(model, samples[0], 'abc'));
    it('update valid id missing', shared.updateMissing(model, samples[0], '123456789012345678901234'));
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
        it('update patient ' + i, shared.update(model, samples[i]));
        it('read updated patient ' + i, shared.read(model, samples[i]));
    }, this);

    it('delete invalid id', shared.deleteMissing(model, 'abc'));
    it('delete valid id missing', shared.deleteMissing(model, '123456789012345678901234'));
    it('delete db error simulation, idToPatientKey', shared.deleteDbError(model, samples[n - 1], 'idToPatientKey'));
    it('delete db error simulation, removeEntry', shared.deleteDbError(model, samples[n - 1], 'removeEntry'));

    it('delete last patient', shared.delete(model, samples[n - 1]));
    it('delete next to last', shared.delete(model, samples[n - 2]));

    it('search (no param)', shared.search(model, null, patients, n - 2));

    after(shared.clearDatabase);
});
