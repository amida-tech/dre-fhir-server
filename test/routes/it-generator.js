'use strict';

var methods = {};

module.exports = function (sampleSets) {
    var result = Object.create(methods);
    result.sampleSets = sampleSets;
    return result;
};

methods.initialize = function (shared) {
    this.shared = shared;
};

methods.config = function() {
	var self = this;
	return function (done) {
    	self.shared.getConfig(done);
	};
};

methods.clearDatabase = function() {
	var self = this;
	return function (done) {
        self.shared.clearDatabase(done);
    };
};

methods.cleanUp = function() {
	var self = this;
	return function (done) {
		self.shared.cleanUp(done);
	};
};

methods.sample = function (setIndex, index) {
    if (index === undefined) {
        index = setIndex;
        setIndex = 0;
    }
    return this.sampleSets[setIndex][index];
};

methods.operation = function(op, setIndex, index) {
    var self = this;
    return function (done) {
        var sample = self.sample(setIndex, index);
        self.shared[op](sample, done);
    };
};

methods.create = function (setIndex, index) {
	return this.operation('create', setIndex, index);
};

methods.createNegative = function (setIndex, index) {
	return this.operation('failCreate', setIndex, index);
};

methods.delete = function(setIndex, index) {
	return this.operation('delete', setIndex, index);
};

methods.update = function(setIndex, index) {
	return this.operation('update', setIndex, index);
};

methods.read = function(setIndex, index) {
	return this.operation('read', setIndex, index);
};

methods.readNegative = function(setIndex, index) {
	return this.operation('readNegative', setIndex, index);
};

methods.searchByPost = function(count, query) {
	var self = this;
    return function (done) {
        self.shared.search(count, true, query, done);
    };
};

methods.search = function(count, query) {
	var self = this;
    return function (done) {
        self.shared.search(count, false, query, done);
    };
};
