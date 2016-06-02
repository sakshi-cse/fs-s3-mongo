'use strict';

const bluebird = require( 'bluebird' );
const R = require( 'ramda' );
const s3UploadStream = require( 's3-upload-stream' );
const aws = require( 'aws-sdk' );
const logger = require( 'brinkbit-logger' )({ __filename, transport: 'production' });

const mapIds = R.map(( id ) => {
    return { Key: id };
});

const getUrl = R.curry(( options, id ) => {
    const url = `https://s3.amazonaws.com/${options.bucket}/${id}`;
    logger.info( `returning url for ${id}: ${url}` );
    return url;
});

const write = R.curry(( s3Stream, options, id, type, content ) => {
    return new Promise(( resolve, reject ) => {
        logger.info( `Initializing upload stream` );
        const upload = s3Stream.upload({
            Bucket: options.bucket,
            Key: id,
            ACL: 'public-read',
            ContentType: type,
        });
        let size = 0;

        if ( options.maxPartSize ) upload.maxPartSize( options.maxPartSize );
        if ( options.concurrentParts ) upload.concurrentParts( options.concurrentParts );

        upload.on( 'error', reject );
        upload.on( 'uploaded', () => resolve( size ));
        upload.on( 'part', data => {
            size += data.uploadedSize;
        });

        content.pipe( upload );
    });
});

const copy = R.curry(( s3, options, oldId, newId ) => {
    logger.info( `Attempting to copy s3 GUID ${oldId} to ${newId}` );
    return s3.copyObjectAsync({
        Bucket: options.bucket,
        Key: newId,
        ACL: 'public-read',
        CopySource: `${options.bucket}/${oldId}`,
    });
});

const destroy = R.curry(( s3, options, ids ) => {
    logger.info( `Attempting to delete s3 GUIDs ${ids}` );
    return s3.deleteObjectsAsync({
        Bucket: options.bucket,
        Delete: {
            Objects: mapIds( ids ),
        },
    });
});

module.exports = ( config ) => {
    if ( typeof config !== 'object' ||
        typeof config.bucket !== 'string' ||
        typeof config.region !== 'string'
    ) throw new Error( 'INVALID_CONFIG' );

    logger.info( `Initializing module with ${config}` );

    const s3 = bluebird.promisifyAll( new aws.S3( config ));
    const s3Stream = s3UploadStream( s3 );
    return {
        write: write( s3Stream, config ),
        copy: copy( s3, config ),
        destroy: destroy( s3, config ),
        getUrl: getUrl( config ),
    };
};
