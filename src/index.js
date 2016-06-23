'use strict';

const uuid = require( 'uuid-v4' );
const R = require( 'ramda' );
const s3Module = require( './s3.js' );
const mongo = require( './mongo.js' );
const error = require( './error.js' );
const logger = require( 'brinkbit-logger' )({ __filename });

// TODO flags
const alias = mongo.alias;

// TODO flags
// TODO return all metadata instead of just ids
const read = R.curry(( s3, id ) => {
    logger.info( `checking isDirectory for ${id}` );
    return mongo.isDirectory( id )
    .then( isDirectory => {
        if ( isDirectory ) {
            logger.info( `${id} is a directory. Calling findChildren on it` );
            return mongo.findChildren( id )
            .then( R.pluck( '_id' ));
        }

        logger.info( `${id} is a resource -- calling getUrl on it` );
        return s3.getUrl( id );
    });
});

// TODO flags
// TODO investigate simplifying to single mongo call if create can also be used as validation
const create = R.curry(( s3, parentId, type, name, content ) => {
    const id = uuid();
    logger.info( `Generated new id for resource: ${id}` );
    logger.info( `Calling findChild on name: ${name}, parentId: ${parentId}` );
    return mongo.findChild( parentId, name )
    .catch( err => {
        // If any error is thrown other than INVALID_RESOURCE (file not found), then bubble it up
        if ( err.message !== 'INVALID_RESOURCE' ) {
            return Promise.reject( err.message );
        }
    })
    .then(() => s3.write( id, type, content ))
    .then( size => mongo.create( parentId, id, type, name, size ));
});

// TODO flags
const inspect = R.curry(( id, fields ) => {
    logger.info( `Attempting to inspect fields: ${fields}` );
    logger.info( `Calling find on id: ${id}` );
    return mongo.find( id )
    .then(( obj ) => {
        return fields ? R.pick( fields, obj ) : obj;
    });
});

// TODO flags
const update = R.curry(( s3, id, content ) => {
    if ( typeof content.pipe === 'function' ) {
        logger.info( `Updating resource data for ${id}` );
        return mongo.update( id )
        .then(() => s3.write( id, content ));
    }

    logger.info( `Updating ${id} with: ${content}` );
    return mongo.update( id, content );
});

// TODO flags
const rename = R.curry(( id, name ) => {
    logger.info( `Attempting to rename ${id} to ${name}` );
    return mongo.update( id, { name });
});

// TODO flags
const destroy = R.curry(( s3, id ) => {
    logger.info( `Attempting to destroy ${id}` );
    return mongo.destroy( id, true )
    .then( s3.destroy );
});

const search = mongo.search;

// TODO
// TODO investigate archiver
const download = R.curry(() => {
    logger.warning( 'Download not implemented' );
    return error.NOT_IMPLEMENTED;
});

// TODO flags
const copy = R.curry(( s3, id, destinationFolderId ) => {
    logger.info( `Attempting to copy resource: ${id}, to destination folder: ${destinationFolderId}` );
    return mongo.copy( id, destinationFolderId )
    .then( records => {
        logger.info( `Updating s3 records: ${records}` );
        return records.map( record => {
            logger.info( `Updating s3 GUID from ${record.id} to ${record.generatedId}` );
            return s3.copy( record.id, record.generatedId );
        });
    });
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
    logger.info( `Initing module with ${JSON.stringify( config )}` );
    const s3 = s3Module( config.s3 );
    return mongo.connect( config.mongo )
    .then(() => Promise.resolve({
        alias,
        read: read( s3 ),
        create: create( s3 ),
        inspect,
        update: update( s3 ),
        rename,
        destroy: destroy( s3 ),

        search,
        download,
        copy: copy( s3 ),
        move,
    }));
};
