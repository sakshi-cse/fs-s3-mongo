'use strict';

const chai = require( 'chai' );
const chaiaspromised = require( 'chai-as-promised' );
const mime = require( 'mime' );
const s3Mongo = require( '../src/index.js' );
const File = require( '../src/schema.js' );

const expect = chai.expect;

const testGuidPrefix = 'TEST-GUID-';
const path = '12345/level1/level2/level3/test.txt';
const pathArray = path.split( '/' );
const testDocuments = {};

chai.use( chaiaspromised );

describe( 'index', function() {
    let s3m;

    describe( '.intializer()', () => {
        it( 'should resolve when the mongodb connection is open', () => {
            return s3Mongo({
                s3: {
                    bucket: process.env.AWS_TEST_BUCKET,
                    region: process.env.AWS_TEST_REGION,
                },
            })
            .then( res => {
                expect( res.alias ).to.be.a.function;
                expect( res.read ).to.be.a.function;
                expect( res.create ).to.be.a.function;
                expect( res.inspect ).to.be.a.function;
                expect( res.update ).to.be.a.function;
                expect( res.rename ).to.be.a.function;
                expect( res.destroy ).to.be.a.function;
                expect( res.search ).to.be.a.function;
                expect( res.download ).to.be.a.function;
                expect( res.copy ).to.be.a.function;
                expect( res.move ).to.be.a.function;
                s3m = res;
            });
        });
    });

    describe( 'static methods', function() {
        beforeEach( function() {
            const promises = pathArray.map(( value, index, array ) => {
                const mimeType = index === array.length - 1 ? mime.lookup( value.split( '.' ).pop()) : 'folder';
                const parents = index !== 0 ? [testGuidPrefix + array[index - 1]] : [];
                const file = testDocuments[ value ] = new File({
                    _id: testGuidPrefix + value,
                    mimeType,
                    size: 12345678,
                    dateCreated: new Date(), // https://docs.mongodb.org/v3.0/reference/method/Date/
                    lastModified: new Date(), // https://docs.mongodb.org/v3.0/reference/method/Date/
                    parents,
                    name: value,
                });
                return file.save();
            });
            return Promise.all( promises );
        });

        afterEach( function() {
            return File.remove({}).exec();
        });

        describe( '#read()', () => {
            it( 'should return an array of children ids if resource is a directory', function() {
                return expect( s3m.read( 'TEST-GUID-level3' )).to.eventually.deep.equal(['TEST-GUID-test.txt']);
            });

            it( 'should return the s3 url if resource is a file', function() {
                return expect( s3m.read( 'TEST-GUID-test.txt' )).to.eventually.equal(
                    `https://${process.env.AWS_TEST_REGION}.amazonaws.com/${process.env.AWS_TEST_BUCKET}/TEST-GUID-test.txt`
                );
            });
        });

        describe( '#create()', () => {
            it( 'should create the file record and resolve' );
        });

        describe( '#search()', () => {

        });

        describe( '#inspect()', () => {

        });

        describe( '#download()', () => {

        });

        describe( '#bulk()', () => {

        });

        describe( '#copy()', () => {

        });

        describe( '#update()', () => {

        });

        describe( '#move()', () => {

        });

        describe( '#rename()', () => {

        });

        describe( '#destroy()', () => {

        });
    });
});
