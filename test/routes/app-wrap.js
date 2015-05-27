'use strict';

var request = require('supertest');
var app = require('../../config/app');

var base = {
    start: function (done) {
        this.server = this.app.listen(3001, done);
    },
    cleanUp: function (done) {
        var self = this;
        var c = this.app.get('connection');
        c.clearDatabase(function (err) {
            if (err) {
                done(err);
            } else {
                c.disconnect(function (err) {
                    if (err) {
                        done(err);
                    } else {
                        self.server.close(done);
                    }
                });
            }
        });
    },
    cleardb: function (done) {
        var c = this.app.get('connection');
        c.clearDatabase(done);
    },
    api: function () {
        return request.agent(this.app);
    }
};

exports.instance = function (dbName, pageSize) {
    var inst = Object.create(base);
    inst.dbName = dbName;
    var db = {
        dbName: dbName
    };
    if (pageSize) {
        db.maxSearch = pageSize;
    }
    inst.app = app({
        db: db
    });
    return inst;
};
