'use strict';

/* eslint-env mocha */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const mongo = require( '../src/mongo.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'doesResourceExist()', () => {
    it( 'should resolve with true if resource is in mongodb', () => {
        const GUID = '12345';

        return expect( mongo.doesResourceExist( GUID )).to.be.resolved
            .and.eventually.be.true;
    });

    it( 'should resolve with false if resource is not in mongodb', () => {
        const GUID = '11111';

        return expect( mongo.doesResourceExist( GUID )).to.be.resolved
            .and.eventually.be.false;
    });
});

describe( 'isDirectory()', () => {
    it( 'should resolve with true if resource has a mimeType of folder', () => {
        const GUID = '12345';

        return expect( mongo.doesResourceExist( GUID )).to.be.resolved
            .and.eventually.be.true;
    });

    it( 'should resolve with false if resource a mimeType of anything else', () => {
        const GUID = '23456';

        return expect( mongo.doesResourceExist( GUID )).to.be.resolved
            .and.eventually.be.false;
    });

    it( 'should reject with RESOURCE_NOT_FOUND if there is no record found', () => {
        const GUID = '00000';

        return expect( mongo.doesResourceExist( GUID )).to.be.rejected
            .and.eventually.equal( 'RESOURCE_NOT_FOUND' );
    });
});
