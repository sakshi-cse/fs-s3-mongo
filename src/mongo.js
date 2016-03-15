'use strict';

const File = require( '../src/schemas/fileSchema.js' );
const mongoose = require( 'mongoose' );
const R = require( 'ramda' );
const conn = mongoose.connection;
const uuid = require( 'uuid-v4' );
mongoose.Promise = Promise;

function mustExist( record ) {
    return record || Promise.reject( 'INVALID_RESOURCE' );
}

exports.connect = function connect() {
    return new Promise(( resolve, reject ) => {
        if ( conn.readyState === 1 ) {
            // we're already connected
            return resolve();
        }
        const ip = process.env.MONGO_IP || 'localhost';
        const mongoAddress = `mongodb://${ip}:27017`;
        mongoose.connect( mongoAddress );
        conn.on( 'error', reject );
        conn.on( 'open', resolve );
    });
};

exports.findByGuid = function findByGuid( id ) {
    return File.findById( id ).exec()
    .then( mustExist );
};

exports.findChildren = function findChildren( id ) {
    return File.findOne({ parents: id }).exec();
};

exports.findChild = function findChild( parentId, childName ) {
    return File.findOne({ $and: [{ name: childName }, { parents: parentId }] }).exec()
    .then( mustExist );
};

// Update last modified timestamp per GUID
exports.setLastModifiedbyGUID = function setLastModifiedbyGUID( id ) {
    return exports.updateByGUID( id, { lastModified: Date.now() });
};

// Update the name per GUID
exports.setNameByGUID = function setNameByGUID( id, name ) {
    return exports.updateByGUID( id, { name, lastModified: Date.now() });
};

// Returns a boolean parameter to the next then() block
exports.isDirectory = function isDirectory( id ) {
    return exports.findByGuid( id )
    .then( record => record.mimeType === 'folder' );
};

exports.alias = function alias( fullPath, rootId ) {
    return R.reduce(( queue, name ) =>
        queue.then(( file ) => exports.findChild( file._id, name )),
        exports.findByGuid( rootId ),
        fullPath.split( '/' )
    )
    .then( file => Promise.resolve( file._id ));
};

exports.create = function create( parentId, mimeType, name, size ) {
    return exports.findByGuid( parentId )
    .then(() => {
        const file = new File({
            _id: uuid(),
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
    return Promise.all([
        exports.findChildren( id )
        .then( children => children ?
            children.map( child => exports.destroy( child._id )) : null
        ),
        File.findOneAndRemove({ _id: id }),
    ]);
};
