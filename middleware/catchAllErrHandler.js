'use strict';

module.exports = function (err, req, res, next) {
    console.log(JSON.stringify(err, undefined, 4));
    res.status(500);
    res.send({
        error: 'internal error'
    });
};
