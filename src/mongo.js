'use strict';

/* eslint no-unused-vars: 0 */

const File = require( '../schemas/file.js' );
const Meta = require( '../schemas/metadata.js' );

// Insert a document
module.exports.insert = function insert( toInsert ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

// Search for a document, with an optional sorting parameter
module.exports.search = function search( toMatch, toSort ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

// Update any matched documents
module.exports.update = function update( toMatch, toUpdate ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

// Delete any matched documents
module.exports.destroy = function destroy( toMatch ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

// Resolve a fullPath and userId to a GUID
module.exports.getGUID = function getGUID( fullPath, userId ) {
    return new Promise(( resolve, reject ) => {
        File.findOne({ $and: [{ parent: fullPath }, { userId: userId }]}, ( err, obj ) => {
            if ( err ) {
                reject( 'INVALID_RESOURCE_PATH' );
            }
            else {
                resolve( obj.metaDataId );
            }
        });
    })

    // Grab the metaData doc by the ID
    .then(( id ) => {
        Meta.findOne({ _id: id }, ( err, obj ) => {
            if ( err ) {
                throw new Error( 'INVALID_RESOURCE' );
            }
            return obj;
        });
    })

    // Return null if there isn't an associated GUID
    .catch(( ) => {
        return null;
    });
};
