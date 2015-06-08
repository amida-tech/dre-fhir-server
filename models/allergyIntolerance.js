'use strict';

var resource = require('./resource-with-patient');

module.exports = resource({
    sectionName: 'allergies',
    patientRefKey: 'patient'
});
