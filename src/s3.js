'use strict';

const aws = require( 'aws-sdk' );

const bucket = new aws.S3({ params: {
    Bucket: process.env.AWS_BUCKET,
    Region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    apiVersion: process.env.AWS_API_VERSION || 3,
}});

// TODO: investigate Bluebird for PromisifyAll
function promisifyS3Action( action, params ) {
    return new Promise(( resolve, reject ) => {
        bucket[action]( params, ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res );
            }
        });
    });
}

// Write content to the s3 bucket via the GUID. Note that this always overwrites
module.exports.write = ( GUID, content ) => {
    const params = {
        Key: GUID,
        Body: content,
    };

    return promisifyS3Action( 'putObject', params );
};

// Copy one GUID's content to another GUID
module.exports.copy = ( fromGUID, toGUID ) => {
    const params = {
        Key: toGUID,
        CopySource: fromGUID,
    };

    return promisifyS3Action( 'copyObject', params );
};

// Delete from s3 by GUID
module.exports.destroy = ( GUID ) => {
    const params = { Key: GUID };

    return promisifyS3Action( 'deleteObject', params );
};

// Grab content by GUID, then compress and return to the client
module.exports.download = () => {
    return Promise.reject( 'NOT_IMPLEMENTED' );
};
