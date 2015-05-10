'use strict';

module.exports = function (err, req, res, next) {
    res.status(500);
    res.send({
        error: 'internal error'
    });
};
