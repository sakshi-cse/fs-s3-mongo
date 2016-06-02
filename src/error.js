'use strict';

const logger = require( 'brinkbit-logger' )({ __filename, transport: 'production' });

function rejectError( message ) {
    logger.error( `Throwing error: ${message}` );
    return Promise.reject( new Error( message ));
}

// TODO: add more errors
module.exports = {
    NOT_IMPLEMENTED: rejectError( 'NOT_IMPLEMENTED' ),
    INVALID_RESOURCE: rejectError( 'INVALID_RESOURCE' ),
    RESOURCE_EXISTS: rejectError( 'RESOURCE_EXISTS' ),
    REQUEST_DATA_TOO_LARGE: rejectError( 'REQUEST_DATA_TOO_LARGE' ),
    INVALID_RESOUCE_TYPE: rejectError( 'INVALID_RESOUCE_TYPE' ),
    INVALID_ACTION: rejectError( 'INVALID_ACTION' ),
    INVALID_PARAMETERS: rejectError( 'INVALID_PARAMETERS' ),
    DEFAULT_SERVER_ERROR: rejectError( 'DEFAULT_SERVER_ERROR' ),
};
