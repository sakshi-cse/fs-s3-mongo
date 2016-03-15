'use strict';

/* eslint-env mocha */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const s3 = require( '../src/s3.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe.skip( 's3 wrapper: ', () => {
    describe( 'read() ', () => {
        it( 'should reject with INVALID_RESOURCE_OR_PATH when given an invalid path', () => {
            const path = 'invalid/path/here/';
            const resource = 'goat.jpg';

            return expect( s3.read( path + resource )).to.be.rejectedWith( 'INVALID_RESOURCE_OR_PATH' );
        });

        it( 'should return a resource when given a valid path', () => {
            const path = 'valid/path/here/';
            const resource = 'goat.jpg';

            // TODO: figure out how to test multi-part form responses
            return expect( s3.read( path + resource )).to.be.fulfilled
                .and.eventually.have.property( 'data' );
        });
    });

    it( 'should be able to write a new resource', () => {
        const path = 'new/valid/path/here/';
        const resource = 'goat.jpg';
        const data = {};

        // TODO: figure out how to test multi-part form data
        return expect( s3.write( path + resource, data )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });

    it( 'should be able to overwrite an existing resource', () => {
        const path = 'existing/valid/path/here/';
        const resource = 'goat.jpg';
        const data = {};

        // TODO: figure out how to test multi-part form data
        return expect( s3.write( path + resource, data )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });

    it( 'should be able to copy an existing resource', () => {
        const path = 'valid/path/here/';
        const resource = 'goat.jpg';
        const newPath = 'new/path/here/';

        return expect( s3.copy( path + resource, newPath + resource )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });

    it( 'should be able to delete an existing resource', () => {
        const path = 'valid/path/here/';
        const resource = 'goat.jpg';

        return expect( s3.destroy( path + resource )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });
});
