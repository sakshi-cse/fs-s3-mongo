'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const modules = require( '../src/index.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'Top level export', () => {
    it( 'should expose fsSearch', () => {
        expect( modules.fsSearch ).to.be.a.function;
    });

    it( 'should expose fsUpdate', () => {
        expect( modules.fsUpdate ).to.be.a.function;
    });

    it( 'should expose fsDelete', () => {
        expect( modules.fsDelete ).to.be.a.function;
    });

    it( 'should expose readResource', () => {
        expect( modules.readResource ).to.be.a.function;
    });

    it( 'should expose writeResource', () => {
        expect( modules.writeResource ).to.be.a.function;
    });

    it( 'should expose copyResource', () => {
        expect( modules.copyResource ).to.be.a.function;
    });

    it( 'should expose deleteResource', () => {
        expect( modules.deleteResource ).to.be.a.function;
    });
});
