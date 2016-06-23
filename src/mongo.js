'use strict';

const uuid = require( 'uuid-v4' );
const mongoose = require( 'mongoose' );
const conn = mongoose.connection;
const R = require( 'ramda' );
const error = require( './error.js' );
const File = require( './schema.js' )( conn );
const logger = require( 'brinkbit-logger' )({ __filename });
const db = require( 'brinkbit-mongodb' )( conn );
mongoose.Promise = Promise;

function mustExist( record ) {
    logger.info( `Checking if ${record} exists` );
    return record || error.INVALID_RESOURCE;
}

function searchChildren( id, params, flags ) {
    logger.info( `Searching for children for ${id}` );
    return exports.findChildren( id )
    .then( children => children.map( child => {
        if ( child.type === 'folder' ) {
            logger.info( `${child._id} is a folder, searching inside of it` );
            return exports.search( child._id, params, flags );
        }

        logger.info( `${child._id} is a resource, returning` );
    }));
}

function searchOne( id, params ) {
    logger.info( `Searching for one record for id: ${id}` );
    const criteria = [{ _id: id }];
    for ( const key in params ) {
        if ( R.has( key, params )) criteria.push({ key: params[key] });
    }
    return File.find({ $and: criteria }).exec();
}

function destroyChildren( id ) {
    logger.info( `Attempting to destroy children for id: ${id}` );
    return exports.findChildren( id )
    .then( children => children ?
        Promise.all( children.map( child => exports.destroy( child._id ))) : id
    );
}

function destroyOne( id ) {
    logger.info( `Attempting to destroy one record for id: ${id}` );
    return File.findOneAndRemove({ _id: id }).exec()
    .then( mustExist )
    .then(() => id );
}

function copyChildren( id, generatedId ) {
    logger.info( `Attempting to copy children from ${id} to ${generatedId}` );
    return exports.findChildren( id )
    .then( children => Promise.all( children.map( child => exports.copy( child._id, generatedId ))));
}

function copyOne( id, destinationFolderId, generatedId ) {
    logger.info( `Attempting to copy one resource; checking if the destination is a folder: ${destinationFolderId}` );
    return exports.isDirectory( destinationFolderId )
    .then( isDirectory => {
        if ( !isDirectory ) {
            logger.error( `${destinationFolderId} is not a folder` );
            return error.INVALID_RESOUCE_TYPE;
        }

        logger.info( `${destinationFolderId} is a folder, attempting to find ${id}` );
        return exports.find( id );
    })
    .then( record => exports.create( destinationFolderId, generatedId, record.mimeType, record.name, record.size ))
    .then(( ) => [{ id, generatedId }]);
}

exports.connect = db.connect;
exports.conn = conn;
exports.File = File;

exports.find = function find( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    logger.info( `Attempting to find one: id: ${id}` );
    return File.findById( id ).exec()
    .then( mustExist );
};

exports.findChildren = function findChildren( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    logger.info( `Attempting to find children for id: ${id}` );
    return File.find({ parents: id }).exec();
};

exports.findChild = function findChild( parentId, childName ) {
    if ( typeof parentId !== 'string' || typeof childName !== 'string' ) return error.INVALID_PARAMETERS;
    logger.info( `Attempting to find a resource named ${childName} under parentId: ${parentId}` );
    return File.findOne({ $and: [{ name: childName }, { parents: parentId }] }).exec()
    .then( mustExist );
};

exports.isDirectory = function isDirectory( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    logger.info( `Checking if ${id} is a folder` );
    return exports.find( id )
    .then( record => record.mimeType === 'folder' );
};

// TODO: upsert
exports.update = function update( id, fields ) {
    logger.info( `Updating ${id} with ${fields}` );
    const safeFields = [ 'parents', 'name', 'size' ];
    const toUpdate = R.pick( safeFields, fields || {});
    toUpdate.lastModified = Date.now();
    return File.findOneAndUpdate({ _id: id }, toUpdate ).exec()
    .then( mustExist );
};


exports.alias = function alias( fullPath, rootId ) {
    if ( typeof fullPath !== 'string' || typeof rootId !== 'string' ) return error.INVALID_PARAMETERS;
    logger.info( `Attempting to alias ${fullPath} for ${rootId} to a GUID` );
    return R.reduce(( queue, name ) =>
        queue.then(( file ) => exports.findChild( file._id, name )),
        exports.find( rootId ),
        fullPath.split( '/' )
    )
    .then( file => Promise.resolve( file._id ));
};

exports.create = function create( parentId, id, mimeType, name, size ) {
    if ( typeof parentId !== 'string' ||
        typeof id !== 'string' ||
        typeof mimeType !== 'string' ||
        typeof name !== 'string' ||
        typeof size !== 'number'
    ) return error.INVALID_PARAMETERS;
    logger.info( `Ensuring that the parentId ${parentId} exists` );
    return exports.find( parentId )
    .then(() => {
        // TODO test if this rejects if document already exists

        logger.info( `Creating new file and saving it` );
        const file = new File({
            _id: id,
            mimeType,
            size,
            dateCreated: new Date(), // https://docs.mongodb.org/v3.0/reference/method/Date/
            lastModified: new Date(), // https://docs.mongodb.org/v3.0/reference/method/Date/
            parents: [parentId],
            name,
        });
        return file.save();
    });
};

exports.destroy = function destroy( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    logger.info( `Attempting to destroy ${id} recursively` );
    return Promise.all([
        destroyChildren( id ),
        destroyOne( id ),
    ])
    .then( R.flatten );
};

exports.copy = function copy( id, destinationFolderId ) {
    if ( typeof id !== 'string' ||
        typeof destinationFolderId !== 'string'
     ) return error.INVALID_PARAMETERS;

    logger.info( `Checking to see if ${id} is a directory` );

    return exports.isDirectory( id )
    .then( isDirectory => {
        const generatedId = uuid();
        if ( !isDirectory ) {
            logger.info( `${id} is a resource, just copying one` );
            return copyOne( id, destinationFolderId, generatedId );
        }

        logger.info( `${id} is a folder, copying recursively` );

        return Promise.all([
            copyOne( id, destinationFolderId, generatedId ),
            copyChildren( id, generatedId ),
        ]);
    })
    .then( R.flatten );
};

// TODO curry the functions to reduce the parameter passing
// TODO handle sorting
exports.search = function search( id, params, sort, flags ) {
    if ( typeof id !== 'string' ||
        typeof params !== 'object' ||
        typeof sort !== 'string' ||
        ![].isArray( flags )
    ) return error.INVALID_PARAMETERS;

    if ( R.contains( 'r', flags )) return searchOne( id, params );

    logger.info( 'Attempting to search recursively' );

    return Promise.all([
        searchOne( id, params ),
        searchChildren( id, params, flags ),
    ])
    .then( R.flatten );
};
