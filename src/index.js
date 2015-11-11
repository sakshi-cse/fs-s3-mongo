'use strict';

const operations = require( './operations.js' );

module.exports = {
    read: operations.read,
    search: operations.search,
    write: operations.write,
    update: operations.update,
    copy: operations.copy,
    destroy: operations.destroy,
};
