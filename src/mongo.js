'use strict';

const File = require( '../src/schemas/fileSchema.js' );
const mongoose = require( 'mongoose' );
const R = require( 'ramda' );
const error = require( './error.js' );
const conn = mongoose.connection;
mongoose.Promise = Promise;

function mustExist( record ) {
    return record || error.INVALID_RESOURCE;
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

// TODO write .copy()
// TODO wrtie .move()
