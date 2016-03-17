'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );
const fs = require( 'fs' );
const s3Module = require( '../src/s3.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 's3', () => {
    let s3;
    describe( 'intializer', function() {
        it( 'should throw "INVALID_CONFIG" with malformed config', function() {
            expect(() => s3Module()).to.throw( 'INVALID_CONFIG' );
            expect(() => s3Module({ bucket: '' })).to.throw( 'INVALID_CONFIG' );
            expect(() => s3Module({ region: '' })).to.throw( 'INVALID_CONFIG' );
        });

        it( 'should return the s3 object', function() {
            s3 = s3Module({
                bucket: process.env.AWS_TEST_BUCKET,
                region: process.env.AWS_TEST_REGION,
            });
        });
    });

    describe( '.write()', function() {
        it( 'should resolve with the size of the resource', function() {
            this.timeout( 10000 );
            return expect(
                s3.write( 'test-guid', 'text/plain', fs.createReadStream( `${__dirname}/testfiles/test.txt` ))
            ).to.eventually.equal( 18 );
        });
    });

    describe( '.destroy()', function() {
        it( 'should resolve', function() {
            this.timeout( 10000 );
            return expect( s3.destroy(['test-guid'])).to.be.fulfilled;
        });
    });

    describe( '.getUrl()', function() {
        it( 'should return the full url of the resource', function() {
            expect( s3.getUrl( 'test-guid' )).to.equal(
                `https://${process.env.AWS_TEST_REGION}.amazonaws.com/${process.env.AWS_TEST_BUCKET}/test-guid`
            );
        });
    });
});
