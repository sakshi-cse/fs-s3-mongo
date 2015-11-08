'use strict';

const mongoModule = require( './mongo.js' );
const s3Module = require( './s3.js' );

module.exports = {
    fsSearch: mongoModule.search,
    fsUpdate: mongoModule.update,
    fsDelete: mongoModule.destroy,
    readResource: s3Module.read,
    writeResource: s3Module.write,
    copyResource: s3Module.copy,
    deleteResource: s3Module.destroy,
};
