'use strict';

/* eslint no-unused-vars: 0 */

module.exports.read = function read( toFind ) {
    // TODO: hit bucket and read

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.write = function write( toWrite ) {
    // TODO: hit bucket and write

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.copy = function copy( toFind, newPlace ) {
    // TODO: hit bucket and copy

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};

module.exports.destroy = function destroy( toFind ) {
    // TODO: hit mongo and delete

    return Promise.reject({ code: 501, message: 'Not implemented.' });
};
