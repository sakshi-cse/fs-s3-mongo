'use strict';

const uuid = require( 'uuid-v4' );
const R = require( 'ramda' );
const s3Module = require( './s3.js' );
const mongo = require( './mongo.js' );
const error = require( './error.js' );

// TODO flags
const alias = mongo.alias;

// TODO flags
// TODO return all metadata instead of just ids
const read = R.curry(( s3, id ) => {
    return mongo.isDirectory( id )
    .then( isDirectory => {
        if ( isDirectory ) {
            return mongo.findChildren( id )
            .then( R.pluck( '_id' ));
        }
        return s3.getUrl( id );
    });
});

// TODO flags
// TODO investigate simplifying to single mongo call if create can also be used as validation
const create = R.curry(( s3, bucket, parentId, type, name, content ) => {
    const id = uuid();
    return mongo.findChild( parentId, name )
    .then(() => s3.write( id, type, content ))
    .then( size => mongo.create( parentId, id, type, name, size ));
});

// TODO flags
const inspect = R.curry(( id, fields ) => {
    return mongo.find( id )
    .then( R.pick( fields ));
});

// TODO flags
const update = R.curry(( s3, id, content ) => {
    if ( typeof content.pipe === 'function' ) {
        return mongo.update( id )
        .then(() => s3.write( id, content ));
    }
    return mongo.update( id, content );
});

// TODO flags
const rename = R.curry(( id, name ) => {
    return mongo.update( id, { name });
});

// TODO flags
const destroy = R.curry(( s3, id ) => {
    return mongo.destroy( id, true )
    .then( s3.destroy );
});

const search = mongo.search;

// TODO
// TODO investigate archiver
const download = R.curry(() => {
    return error.NOT_IMPLEMENTED;
});

// TODO flags
const copy = R.curry(( s3, id, destinationFolderId ) => {
    return mongo.copy( id, destinationFolderId )
    .then( records => records.map( record => s3.copy( record.id, record.generatedId )));
});

// TODO flags
const move = R.curry(( moveId, destinationId ) => {
    return mongo.isDirectory( destinationId )
    .then( isDirectory => {
        if ( !isDirectory ) return error.INVALID_RESOUCE_TYPE;
        return mongo.update( moveId, { parents: [destinationId] });
    });
});

module.exports = ( config ) => {
    const s3 = s3Module( config.s3 );
    return mongo.connect( config.mongo )
    .then(() => Promise.resolve({
        alias: alias,
        read: read( s3 ),
        create: create( s3 ),
        inspect: inspect,
        update: update( s3 ),
        rename: rename,
        destroy: destroy( s3 ),

        search: search,
        download: download,
        copy: copy( s3 ),
        move: move,
    }));
};
