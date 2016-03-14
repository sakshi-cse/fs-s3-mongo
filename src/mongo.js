'use strict';

/* eslint no-unused-vars: 0 */

const utils = require( './utils.js' );
const Meta = require( '../schemas/metadata.js' );

// exports = module.exports;

// Insert a document
module.exports.insert = Meta.insert;

// Search for a document, with an optional sorting parameter
module.exports.findByParameter = Meta.find;

// Delete document by GUID
module.exports.deleteByGUID = Meta.findByIdAndRemove;

// Update last modified timestamp per GUID
module.exports.setLastModifiedbyGUID = ( GUID ) => module.exports.updateByGUID( GUID, { lastModified: Date.now() });

// Update the name per GUID
module.exports.setNameByGUID = ( GUID, name ) => module.exports.updateByGUID( GUID, { name, lastModified: Date.now() });

// Generalized update function by GUID
module.exports.updateByGUID = Meta.findByIdAndUpdate;

// Return mongo document by GUID. Throws error if no document is found
module.exports.findByGUID = Meta.findById;

// Returns a boolean parameter to the next then() block
module.exports.doesResourceExist = function doesResourceExist( GUID ) {
    return exports.findByGUID( GUID )
    .exec()
    .then( record => !!record )
    .catch( utils.handleError );
};

// Returns a boolean parameter to the next then() block
module.exports.isDirectory = function isDirectory( GUID ) {
    exports.findByGUID( GUID )
    .exec()
    .then( record => {
        if ( !record ) {
            throw new Error( 'RESOURCE_NOT_FOUND' );
        }

        return record.mimeType === 'folder';
    })
    .catch( utils.handleError );
};
