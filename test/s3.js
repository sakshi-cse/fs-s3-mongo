'use strict';

/* eslint-env mocha */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const modules = require( '../src/index.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 's3 wrapper', () => {
    it( 'should return a resource when given a proper path', () => {
        const path = 'valid/path/here/';
        const resource = 'goat.jpg';

        // TODO: figure out how to test multi-part form responses
        return expect( modules.readResource( path + resource )).to.be.fulfilled
            .and.eventually.have.property( 'data' );
    });

    it( 'should be able to write a new resource', () => {
        const path = 'new/valid/path/here/';
        const resource = 'goat.jpg';
        const data = {};

        // TODO: figure out how to test multi-part form data
        return expect( modules.writeResource( path + resource, data )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });

    it( 'should be able to overwrite an existing resource', () => {
        const path = 'existing/valid/path/here/';
        const resource = 'goat.jpg';
        const data = {};

        // TODO: figure out how to test multi-part form data
        return expect( modules.writeResource( path + resource, data )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });

    it( 'should be able to copy an existing resource', () => {
        const path = 'valid/path/here/';
        const resource = 'goat.jpg';
        const newPath = 'new/path/here/';

        return expect( modules.copyResource( path + resource, newPath + resource )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });

    it( 'should be able to delete an existing resource', () => {
        const path = 'valid/path/here/';
        const resource = 'goat.jpg';

        return expect( modules.readResource( path + resource )).to.be.fulfilled
            .and.eventually.have.property( 'status' ).and.equal( 'SUCCESS' );
    });
});
