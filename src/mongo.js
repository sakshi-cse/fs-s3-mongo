'use strict';

/* eslint no-unused-vars: 0 */

module.exports.search = function search( toFind ) {
    // TODO: hit mongo and search

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.update = function update( toFind, toUpdate ) {
    // TODO: hit mongo and update

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.destroy = function destroy( toFind ) {
    // TODO: hit mongo and delete

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};
