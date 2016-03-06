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
        let toReturn = {};

        // If fields are specified, then only return those
        if ( fields && fields.length ) {
            fields.forEach( element => {
                const val = _.get( record, element );
                if ( val ) {
                    toReturn[element] = val;
                }
            });
        }
        else {
            toReturn = record;
        }

        return toReturn;
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

// GUID is for the parent directory
module.exports.create = function create( GUID, type, name, content, flags ) {
    const _id = uuid();
    let isForced = false;

    return mongo.findByParameter({ name, parents: { $in: GUID }})
    .then( record => {
        // If the resource exists and there is no force flag, throw error
        if ( record.length && flags.indexOf( 'f' ) > -1 ) {
            throw new Error( 'RESOURCE_EXISTS' );
        }
        else if ( record.length ) {
            isForced = true;
        }

        return isForced ? record._id : _id;
    })
    .then(( key ) => {
        return s3.write( key, content )
        .then(() => Promise.resolve( key ));
    })
    .then( key => {
        if ( isForced ) {
            return mongo.setLastModifiedbyGUID( key );
        }

        // TODO: create mapping of extension to mimeType
        // TODO: determine size of file
        const mimeType = type === 'folder' ? 'folder' : name.split( '.' )[1];
        return mongo.insertDocument({
            _id,
            name,
            mimeType,
            size: 9999,
            dateCreated: Date.now(),
            lastModified: Date.now(),
            parents: [GUID],
        })
        .exec();
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

    // First check to see if the resource exists, and check the -f flag if needed
    return mongo.doesResourceExist( GUID )
    .then( exists => {
        if ( !exists && flags.indexOf( 'f' ) > -1 ) {
            throw new Error( 'RESOURCE_NOT_FOUND' );
        }
        else if ( exists ) {
            isForced = true;
        }

        return mongo.isDirectory( GUID );
    })
    .then(( isDirectory ) => {
        if ( isDirectory ) {
            throw new Error( 'INVALID_RESOUCE_TYPE' );
        }

        return s3.write( GUID, content );
    })
    .then(( ) => {
        // TODO: create mapping of extension to mimeType (module: mime)
        // TODO: determine size of file
        if ( isForced ) {
            const mimeType = name.split( '.' )[1];
            return mongo.insertDocument({
                _id: uuid(),
                name: name,
                mimeType: mimeType,
                size: 9999,
                dateCreated: Date.now(),
                lastModified: Date.now(),
                // parents: [userId],
            })
            .exec();
        }

        return mongo.setLastModifiedbyGUID( GUID );
    })
    .catch( err => utils.handleError( err ));
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
    return mongo.isDirectory( GUID )
    .then( isDirectory => {
        if ( isDirectory ) {
            return Promise.reject( 'NOT_IMPLEMENTED' );
        }

        return s3.destroy( GUID );
    })
    .then(( ) => {
        return mongo.deleteByGUID( GUID );
    })
    .catch( utils.handleError );
};
