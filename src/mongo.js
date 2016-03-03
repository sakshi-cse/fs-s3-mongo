'use strict';

/* eslint no-unused-vars: 0 */

const utils = require( './utils.js' );
const Meta = require( '../schemas/metadata.js' );

// Insert a document
module.exports.insert = function insert( toInsert ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

// Search for a document, with an optional sorting parameter
module.exports.findByParameter = function search( toMatch, toSort ) {
    return new Promise(( resolve, reject ) => {
        Meta.find( toMatch, toSort, ( err, data ) => {
            if ( err ) {
                reject( err );
            }

            resolve( data );
        });
    });
};

// Delete document by GUID
module.exports.deleteByGUID = function deleteByGUID( GUID ) {
    return new Promise(( resolve, reject ) => {
        Meta.findByIdAndRemove( GUID, ( err, data ) => {
            if ( err ) {
                reject( err );
            }

            resolve( data );
        });
    });
};

// Update last modified timestamp per GUID
module.exports.setLastModifiedbyGUID = function setLastModifiedbyGUID( GUID ) {
    return module.exports.updateByGUID( GUID, { lastModified: Date.now() });
};

// Update the name per GUID
module.exports.setNameByGUID = function setNameByGUID( GUID, name ) {
    return module.exports.updateByGUID( GUID, {
        name: name,
        lastModified: Date.now(),
    });
};


// Generalized update function by GUID
module.exports.updateByGUID = function updateByGUID( GUID, toUpdate ) {
    return new Promise(( resolve, reject ) => {
        Meta.findByIdAndUpdate( GUID, toUpdate, ( err, data ) => {
            if ( err ) {
                reject( err );
            }

            resolve( data );
        });
    });
};

// Return mongo document by GUID. Throws error if no document is found
module.exports.findByGUID = function findByGUID( GUID ) {
    return new Promise(( resolve, reject ) => {
        Meta.findById( GUID, ( err, data ) => {
            if ( err || !data ) {
                reject( err || 'RESOURCE_NOT_FOUND' );
            }

            resolve( data );
        });
    });
};

// Returns a boolean parameter to the next then() block
module.exports.doesResourceExist = function doesResourceExist( GUID ) {
    return module.exports.findByGUID( GUID )
    .then( record => !!record )
    .catch( utils.handleError );
};

// Returns a boolean parameter to the next then() block
module.exports.isDirectory = function isDirectory( GUID ) {
    return new Promise(( resolve, reject ) => {
        module.exports.findByGUID( GUID )
        .then( record => record.mimeType === 'folder' )
        .catch( utils.handleError );
    });
};
