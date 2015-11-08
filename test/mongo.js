'use strict';

/* eslint-env mocha */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const modules = require( '../src/index.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'mongo wrapper', () => {
    it( 'should resolve with an array of resources when given a valid search object', () => {
        const searchObj = { id: 12345 };

        // TODO: Figure out proper number
        const numFiles = 4;

        return expect( modules.fsSearch( searchObj )).to.be.fulfilled
            .and.eventually.have.property( 'data' ).to.be.instanceof( Array ).and.have.length( numFiles );
    });

    it( 'should resolve with an array of sorted resources when given a search object and sorting parameters', () => {
        const searchObj = { id: 12345 };
        const sorting = 'alphabetical';

        // TODO: Figure out files
        const files = [ 'a.txt', 'b.txt', 'c.gif' ];

        return expect( modules.fsSearch( searchObj, sorting )).to.be.fulfilled
            .and.eventually.have.property( 'data' ).to.be.instanceof( Array ).and.deep.equal( files );
    });

    it( 'should resolve with an empty array when given a valid search object that doesn\'t match anything', () => {
        const searchObj = { id: null };

        return expect( modules.fsSearch( searchObj )).to.be.fulfilled
            .and.eventually.have.property( 'data' ).to.be.instanceof( Array ).and.have.length( 0 );
    });

    it( 'should resolve with SUCCESS when updating with a valid search object and update object', () => {
        const searchObj = { id: 12345 };
        const updateObj = { metaData: 'someData' };

        return expect( modules.fsUpdate( searchObj, updateObj )).to.be.fulfilled
            .and.eventually.have.property( 'status', 'SUCCESS' );
    });

    it( 'should reject with 409/invalid resource attempting to update with an invalid object', () => {
        const searchObj = { id: null };
        const updateObj = { metaData: 'someData' };

        return expect( modules.fsUpdate( searchObj, updateObj )).to.be.rejected
            .and.eventually.deep.equal({
                code: 404,
                message: 'Resource does not exist.',
            });
    });

    it( 'should resolve with SUCCESS when deleting with a valid search object', () => {
        const searchObj = { id: 12345 };

        return expect( modules.fsDelete( searchObj )).to.be.fulfilled
            .and.eventually.have.property( 'status', 'SUCCESS' );
    });

    it( 'should reject with 409/invalid resource attempting to delete with an invalid object', () => {
        const searchObj = { id: 12345 };

        return expect( modules.fsDelete( searchObj )).to.be.rejected
            .and.eventually.deep.equal({
                code: 404,
                message: 'Resource does not exist.',
            });
    });
});
