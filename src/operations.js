'use strict';

/* eslint no-unused-vars: 0 */

const mongo = require( './mongo.js' );
const s3 = require( './s3.js' );
const utils = require( './utils.js' );

module.exports.read = function read( toFind ) {
    return s3.read( toFind )
    .catch( utils.handleError );
};

module.exports.search = function search( toFind ) {
    return mongo.search( toFind )
    .catch( utils.handleError );
};

module.exports.write = function write( toWrite ) {
    return s3.write( toWrite )
    .then(( data ) => {
        // Configure data

        return data;
    })
    .then( mongo.update )
    .catch( utils.handleError );
};

module.exports.update = function update( toFind, toWrite ) {
    return s3.write( toWrite )
    .then(( data ) => {
        // Configure data

        return data;
    })
    .then( mongo.update )
    .catch( utils.handleError );
};

module.exports.copy = function copy( toFind, destination ) {
    return s3.copy( toFind, destination )
    .then(( data ) => {
        // Configure data

        return data;
    })
    .then( mongo.update )
    .catch( utils.handleError );
};

module.exports.destroy = function destroy( toFind ) {
    return s3.destroy( toFind )
    .then(( data ) => {
        // Configure data

        return data;
    })
    .then( mongo.toFind )
    .catch( utils.handleError );
};
