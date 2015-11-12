'use strict';

/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );
const sinon = require( 'sinon' );

const index = require( '../src/index.js' );
const s3 = require( '../src/s3.js' );
const mongo = require( '../src/mongo.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'Top-level export', () => {
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

describe( 'Operations: ', () => {
    it( 'read() should call into s3.read()', () => {
        const path = '/valid/path/here/';
        const resource = 'test.txt';

        const spy = sinon.spy( s3, 'read' );

        index.read( path + resource );

        expect( spy ).to.be.calledOnce;
        expect( spy ).to.be.calledWithExactly( path + resource );

        s3.read.restore();
    });

    it( 'search() should call into mongo.search()', () => {
        const toFind = { id: 12345 };

        const spy = sinon.spy( mongo, 'search' );

        index.search( toFind );

        expect( spy ).to.be.calledOnce;
        expect( spy ).to.be.calledWithExactly( toFind );

        mongo.search.restore();
    });

    it( 'write() should call into s3.write() then mongo.update()', () => {
        const path = '/valid/path/here/';
        const resource = 'test.txt';
        const data = {};

        const s3Spy = sinon.spy( s3, 'write' );
        const mongoSpy = sinon.spy( mongo, 'update' );

        index.write( path + resource, data );

        expect( s3Spy ).to.be.calledOnce;
        expect( s3Spy ).to.be.calledWithExactly( path + resource, data );
        expect( s3Spy ).to.be.calledBefore( mongoSpy );

        expect( mongoSpy ).to.be.calledOnce;
        expect( mongoSpy ).to.be.calledWithExactly( path + resource, data );
        expect( mongoSpy ).to.be.calledAfter( s3Spy );

        s3.write.restore();
        mongo.update.restore();
    });

    it( 'update() should call into s3.write() then mongo.update()', () => {
        const path = '/valid/path/here/';
        const resource = 'test.txt';
        const data = {};

        const s3Spy = sinon.spy( s3, 'write' );
        const mongoSpy = sinon.spy( mongo, 'update' );

        index.update( path + resource, data );

        expect( s3Spy ).to.be.calledOnce;
        expect( s3Spy ).to.be.calledWithExactly( path + resource, data );
        expect( s3Spy ).to.be.calledBefore( mongoSpy );

        expect( mongoSpy ).to.be.calledOnce;
        expect( mongoSpy ).to.be.calledWithExactly( path + resource, data );
        expect( mongoSpy ).to.be.calledAfter( s3Spy );

        s3.write.restore();
        mongo.update.restore();
    });

    it( 'copy() should call into s3.copy() then mongo.update()', () => {
        const path = '/valid/path/here/';
        const resource = 'test.txt';
        const destination = '/new/valid/path/here/';

        const s3Spy = sinon.spy( s3, 'copy' );
        const mongoSpy = sinon.spy( mongo, 'update' );

        index.copy( path + resource, destination );

        expect( s3Spy ).to.be.calledOnce;
        expect( s3Spy ).to.be.calledWithExactly( path + resource, destination );
        expect( s3Spy ).to.be.calledBefore( mongoSpy );

        expect( mongoSpy ).to.be.calledOnce;
        expect( mongoSpy ).to.be.calledWithExactly( path + resource, destination );
        expect( mongoSpy ).to.be.calledAfter( s3Spy );

        s3.copy.restore();
        mongo.update.restore();
    });

    it( 'destroy() should call into s3.destroy() then mongo.destroy()', () => {
        const path = '/valid/path/here/';
        const resource = 'test.txt';

        const s3Spy = sinon.spy( s3, 'destroy' );
        const mongoSpy = sinon.spy( mongo, 'destroy' );

        index.destroy( path + resource );

        expect( s3Spy ).to.be.calledOnce;
        expect( s3Spy ).to.be.calledWithExactly( path + resource );
        expect( s3Spy ).to.be.calledBefore( mongoSpy );

        expect( mongoSpy ).to.be.calledOnce;
        expect( mongoSpy ).to.be.calledWithExactly( path + resource );
        expect( mongoSpy ).to.be.calledAfter( s3Spy );

        s3.destroy.restore();
        mongo.destroy.restore();
    });
});
