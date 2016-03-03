'use strict';

/* eslint no-unused-vars: 0 */

const mongo = require( './mongo.js' );
const s3 = require( './s3.js' );
const utils = require( './utils.js' );
const uuid = require( 'uuid-v4' );
const _ = require( 'lodash' );

module.exports.read = function read( GUID, flags ) {
    return mongo.isDirectory( GUID )
    .then( isDirectory => {
        if ( isDirectory ) {
            // TODO: Convert from [flags] to searchable object
            // return mongo.search({ _id: GUID }, '*', null );

            return Promise.reject( 'NOT_IMPLEMENTED' );
        }

        return s3.read( GUID );
    })
    .catch( utils.handleError );
};

module.exports.search = function search( GUID, searchObj, orderObj, flags ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
    // return mongo.search( GUID, searchObj, orderObj )
    // .catch( utils.handleError );
};

module.exports.inspect = function inspect( GUID, fields ) {
    return mongo.findByGUID( GUID )
    .then( record => {
        // If fields are specified, then only return those
        if ( fields.length ) {
            // TODO: filter returned fields
        }
    });
};

module.exports.download = function download( GUID, compressionType ) {
    return mongo.isDirectory( GUID )
    .then( isDirectory => {
        if ( isDirectory ) {
            return Promise.reject( 'NOT_IMPLEMENTED' );
        }

        return Promise.reject( 'NOT_IMPLEMENTED' );
    });
};

module.exports.create = function create( GUID, mimeType, name, content, flags ) {
    const newUUID = uuid();
    let isForced = false;

    return mongo.doesResourceExist( GUID )
    .then( exists => {
        // If the resource exists and there is no force flag, throw error
        if ( exists && flags.indexOf( 'f' ) === -1 ) {
            throw new Error( 'RESOURCE_EXISTS' );
        }
        else if ( exists ) {
            isForced = true;
        }
    })
    .then(() => {
        return s3.write( newUUID, content );
    })
    .then( data => {
        if ( isForced ) {
            return mongo.setLastModifiedbyGUID( GUID );
        }

        // TODO: add the user to the array
        return mongo.update({
            _id: newUUID,
            mimeType: mimeType,
            name: name,
            dateCreated: Date.now(),
            lastModified: Date.now(),
            parents: [null],
        });
    })
    .catch( utils.handleError );
};

// TODO: refactor bulk once API is finalized
module.exports.bulk = function bulk( GUID, content ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

module.exports.copy = function copy( resourceGUID, destinationGUID, flags ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );

    // const copyUUID = uuid();
    //
    // return s3.copy( resourceGUID, copyUUID )
    // .then(( ) => {
    //     return mongo.search({ _id: resourceGUID });
    // })
    // .then(( record ) => {
    //     // TODO: insert records here
    // });
    // .catch( utils.handleError );
};

module.exports.update = function update( GUID, content, flags ) {
    let isForced = false;

    return mongo.doesResourceExist( GUID )
    .then( exists => {
        // If the resource exists and there is no force flag, throw error
        if ( !exists && flags.indexOf( 'f' ) === -1 ) {
            throw new Error( 'RESOURCE_NOT_FOUND' );
        }
        else if ( !exists ) {
            isForced = true;
        }
    })
    .then(() => {
        return s3.write( GUID, content );
    })
    .then( data => {
        if ( isForced ) {
            // TODO: insert the entire record into mongo
        }

        return mongo.setLastModifiedbyGUID( GUID );
    })
    .catch( utils.handleError );
};

module.exports.move = function move( resourceGUID, destinationGUID, flags ) {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};

// TODO: handle flags
module.exports.rename = function rename( GUID, name, flags ) {
    return mongo.setNameByGUID( GUID, name )
    .catch( utils.handleError );
};

module.exports.destroy = function destroy( GUID ) {
    return s3.destroy( GUID )
    .then(() => {
        return mongo.deleteByGUID( GUID );
    })
    .catch( utils.handleError );
};
