'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const sinonchai = require( 'sinon-chai' );

const index = require( '../src/index.js' );

chai.use( sinonchai );
chai.use( chaiaspromised );

describe( 'index', function() {
    describe( 'Top-level FS API', () => {
        it( 'should expose read', () => {
            expect( index.read ).to.be.a.function;
        });

        it( 'should expose search', () => {
            expect( index.search ).to.be.a.function;
        });

        it( 'should expose inspect', () => {
            expect( index.inspect ).to.be.a.function;
        });

        it( 'should expose download', () => {
            expect( index.download ).to.be.a.function;
        });

        it( 'should expose create', () => {
            expect( index.create ).to.be.a.function;
        });

        it( 'should expose bulk', () => {
            expect( index.bulk ).to.be.a.function;
        });

        it( 'should expose copy', () => {
            expect( index.copy ).to.be.a.function;
        });

        it( 'should expose update', () => {
            expect( index.update ).to.be.a.function;
        });

        it( 'should expose move', () => {
            expect( index.move ).to.be.a.function;
        });

        it( 'should expose rename', () => {
            expect( index.rename ).to.be.a.function;
        });

        it( 'should expose destroy', () => {
            expect( index.destroy ).to.be.a.function;
        });
    });

    describe.skip( 'FS OPERATIONS:', () => {
        describe( 'read()', () => {
            it( 'should return INVALID_RESOURCE if passed an invalid GUID', () => {
                const GUID = '00000';

                return expect( index.read( GUID )).to.be.rejected
                    .and.eventually.equal( 'INVALID_RESOURCE' );
            });

            it( 'should return NOT_IMPLEMENTED if passed a valid GUID for a folder', () => {
                const GUID = '23456';

                return expect( index.read( GUID )).to.be.rejected
                    .and.eventually.equal( 'NOT_IMPLEMENTED' );
            });

            it( 'should call into mongo.isDirectory() then s3.read() when passed a valid GUID for a file', () => {
                const GUID = '12345';

                index.read( GUID );

                // expect( isDirectorySpy ).to.be.calledOnce;
                // expect( isDirectorySpy ).to.be.calledWithExactly( GUID );
                // expect( isDirectorySpy ).to.be.calledBefore( s3ReadSpy );

                // expect( s3ReadSpy ).to.be.calledOnce;
                // expect( s3ReadSpy ).to.be.calledWithExactly( GUID );
            });

            it( 'should return data for a valid file GUID', () => {
                const GUID = '12345';

                return expect( index.read( GUID )).to.be.resolved
                    .and.eventually.equal( 'this is the body.' );
            });
        });

        describe( 'create()', () => {
            it( 'should return RESOURCE_EXISTS if a resource already exists there and no force flag is passed in', () => {
                const GUID = '12345';
                const type = 'file';
                const name = 'a.txt';
                const content = 'this is the body.';

                return expect( index.create( GUID, type, name, content )).to.be.rejected
                    .and.eventually.equal( 'RESOURCE_EXISTS' );
            });

            it( 'should call into mongo.findByParameter(), s3.write(), then mongo.insert() with a valid GUID and a new name', () => {
                const GUID = '12345';
                const type = 'file';
                const name = 'newname.txt';
                const content = 'this is the body.';

                index.create( GUID, type, name, content );

                // expect( findByParameterSpy ).to.be.calledOnce;
                // expect( findByParameterSpy ).to.be.calledWithExactly({ name, parents: { $in: GUID }});
                // expect( findByParameterSpy ).to.be.calledBefore( s3WriteSpy );
                //
                // expect( s3WriteSpy ).to.be.calledOnce;
                // expect( s3WriteSpy ).to.be.calledBefore( insertSpy );
                //
                // expect( insertSpy ).to.be.calledOnce;
            });

            it( 'should call into mongo.findByParameter(), s3.write(), then mongo.setLastModifiedbyGUID() with a valid GUID, existing name, and the force flag', () => {

            });

            it( 'should overwrite an existing GUID and update the lastModified if passed the -f flag', () => {

            });

            it( 'should write to s3 and add an entry in mongo if given a valid GUID and new name', () => {

            });
        });

        describe( 'Update()', () => {
            it( 'should return RESOURCE_NOT_FOUND if there is no matching resource', () => {
                const GUID = '00000';
                const content = 'this is the body.';

                return expect( index.update( GUID, content )).to.be.rejected
                    .and.eventually.equal( 'RESOURCE_NOT_FOUND' );
            });

            it( 'should call into mongo.doesResourceExist(), mongo.isDirectory(), s3.write(), then mongo.setLastModifiedbyGUID() with a valid GUID', () => {

            });

            it( 'should write to s3 and update the last modified in mongo if given a valid GUID', () => {

            });

            it( 'should call into mongo.doesResourceExist(), mongo.isDirectory(), s3.write(), then mongo.insert() with a valid GUID', () => {

            });

            it( 'should create a new resource if given a valid GUID and new name, and passed the -f flag', () => {

            });
        });

        describe( 'destroy()', () => {
            it( 'should reject with RESOURCE_NOT_FOUND if given an invalid GUID', () => {
                const GUID = '00000';

                expect( index.destroy( GUID )).to.be.rejected
                    .and.eventually.equal( 'RESOURCE_NOT_FOUND' );
            });

            it( 'should call into s3.destroy(), then deleteByGUID() when given a valid GUID', () => {
                const GUID = '12345';

                index.destroy( GUID );

                // expect( s3DestroySpy ).to.be.calledOnce;
                // expect( s3DestroySpy ).to.be.calledWithExactly( GUID );
                // expect( s3DestroySpy ).to.be.calledBefore( deleteByGUIDSpy );
                //
                // expect( deleteByGUIDSpy ).to.be.calledOnce;
                // expect( deleteByGUIDSpy ).to.be.calledWithExactly( GUID );
            });

            it( 'should remove the s3 entry and the mongodb record when given a valid GUID', () => {

            });
        });
    });
});
