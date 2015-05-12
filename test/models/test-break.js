'use strict';

var chai = require('chai');
var bbr = require('blue-button-record');

var model = require('../../models/allergyIntolerance');
var _ = require('lodash');

var shared = require('./shared')({
    patientRefKey: 'patient'
});

var expect = chai.expect;

describe('model break tests', function () {
    before('connectDatabase', shared.connectDatabase('fhirmodelbreak'));

    var junk = {
        junk: 'junk'
    };

    it('create with bad resource', function (done) {
        model.create(bbr, junk, function (err, id) {
            expect(err).to.exist;
            expect(err.codeDetail).to.exist;
            expect(err.codeDetail.statusCode).to.equal(400);
            done();
        });
    });

    after(shared.clearDatabase);
});
