'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const index = require( '../src/index.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'Index.js', () => {
    it( 'should expose read', () => {
        expect( index.read ).to.be.a.function;
    });

    it( 'should expose search', () => {
        expect( index.search ).to.be.a.function;
    });

    it( 'should expose write', () => {
        expect( index.write ).to.be.a.function;
    });

    it( 'should expose update', () => {
        expect( index.update ).to.be.a.function;
    });

    it( 'should expose copy', () => {
        expect( index.copy ).to.be.a.function;
    });

    it( 'should expose destroy', () => {
        expect( index.destroy ).to.be.a.function;
    });
});
