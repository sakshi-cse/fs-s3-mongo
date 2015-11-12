'use strict';

// TODO: add more errors
const errObject = {
    'NOT_IMPLEMENTED': 'NOT_IMPLEMENTED',
    'DEFAULT_SERVER_ERROR': 'DEFAULT_SERVER_ERROR',
};

module.exports.handleError = function handleError( errorCode ) {
    // TODO: resolve thrown errors to code

    const err = errObject[errorCode] ? errObject[errorCode] : errObject.DEFAULT_SERVER_ERROR;
    throw new Error( err );
};
