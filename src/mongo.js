'use strict';

const uuid = require( 'uuid-v4' );
const mongoose = require( 'mongoose' );
const R = require( 'ramda' );
const error = require( './error.js' );
const File = require( './schema.js' );
const conn = mongoose.connection;
mongoose.Promise = Promise;

function mustExist( record ) {
    return record || error.INVALID_RESOURCE;
}

function searchChildren( id, params, flags ) {
    return exports.findChildren( id )
    .then( children => children.map( child => {
        if ( child.type === 'folder' ) return exports.search( child._id, params, flags );
    }));
}

function searchOne( id, params ) {
    const criteria = [{ _id: id }];
    for ( const key in params ) {
        if ( R.has( key, params )) criteria.push({ key: params[key] });
    }
    return File.find({ $and: criteria }).exec();
}

function destroyChildren( id ) {
    return exports.findChildren( id )
    .then( children => children ?
        Promise.all( children.map( child => exports.destroy( child._id ))) : id
    );
}

function destroyOne( id ) {
    return File.findOneAndRemove({ _id: id }).exec()
    .then( mustExist )
    .then(() => id );
}

function copyChildren( id, generatedId ) {
    return exports.findChildren( id )
    .then( children => Promise.all( children.map( child => exports.copy( child._id, generatedId ))));
}

function copyOne( id, destinationFolderId, generatedId ) {
    return exports.isDirectory( destinationFolderId )
    .then( isDirectory => {
        if ( !isDirectory ) return error.INVALID_RESOUCE_TYPE;
        return exports.find( id );
    })
    .then( record => exports.create( destinationFolderId, generatedId, record.mimeType, record.name, record.size ))
    .then(( ) => [{ id, generatedId }]);
}

exports.connect = function connect( config ) {
    return new Promise(( resolve, reject ) => {
        if ( conn.readyState === 1 ) {
            // we're already connected
            return resolve();
        }
        const ip = config && config.ip ? config.ip : process.env.MONGO_IP || 'localhost';
        const mongoAddress = `mongodb://${ip}:27017`;
        mongoose.connect( mongoAddress );
        conn.on( 'error', reject );
        conn.on( 'open', resolve );
    });
};


exports.find = function find( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    return File.findById( id ).exec()
    .then( mustExist );
};

exports.findChildren = function findChildren( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    return File.find({ parents: id }).exec();
};

exports.findChild = function findChild( parentId, childName ) {
    if ( typeof parentId !== 'string' || typeof childName !== 'string' ) return error.INVALID_PARAMETERS;
    return File.findOne({ $and: [{ name: childName }, { parents: parentId }] }).exec()
    .then( mustExist );
};

exports.isDirectory = function isDirectory( id ) {
    if ( typeof id !== 'string' ) return error.INVALID_PARAMETERS;
    return exports.find( id )
    .then( record => record.mimeType === 'folder' );
};

// TODO: upsert
exports.update = function update( id, fields ) {
    const safeFields = [ 'parents', 'name', 'size' ];
    const toUpdate = R.pick( safeFields, fields || {});
    toUpdate.lastModified = Date.now();
    return File.findOneAndUpdate({ _id: id }, toUpdate ).exec()
    .then( mustExist );
};


exports.alias = function alias( fullPath, rootId ) {
    if ( typeof fullPath !== 'string' || typeof rootId !== 'string' ) return error.INVALID_PARAMETERS;
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
    return exports.find( parentId )
    .then(() => {
        // TODO test if this rejects if document already exists
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

    return exports.isDirectory( id )
    .then( isDirectory => {
        const generatedId = uuid();
        if ( !isDirectory ) return copyOne( id, destinationFolderId, generatedId );
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

    return Promise.all([
        searchOne( id, params ),
        searchChildren( id, params, flags ),
    ])
    .then( R.flatten );
};
