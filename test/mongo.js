'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const chaiaspromised = require( 'chai-as-promised' );
const mime = require( 'mime' );
const mongo = require( '../src/mongo.js' );
const File = require( '../src/schema.js' );

chai.use( chaiaspromised );

const testGuidPrefix = 'TEST-GUID-';
const rootId = testGuidPrefix + '12345';
const path = '12345/level1/level2/level3/test.txt';
const pathArray = path.split( '/' );
const testDocuments = {};

describe( 'mongo', () => {
    before( function() {
        return mongo.connect();
    });

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

    // TODO test .connect()

    // TODO test flags
    describe( '.find()', function() {
        it( 'should resolve with a valid resource', function() {
            return mongo.find( 'TEST-GUID-level3' )
            .then( resource => expect( testDocuments.level3.equals( resource )).to.be.true );
        });

        it( 'should reject with INVALID_RESOURCE for an invalid resource', function() {
            return expect( mongo.find( 'DOES-NOT-EXIST' )).to.be.rejectedWith( 'INVALID_RESOURCE' );
        });
    });

    // TODO test .findChildren()
    // TODO test .findChild()

    // TODO test flags
    describe( '.isDirectory()', () => {
        it( 'should resolve with true if resource has a mimeType of folder', function() {
            return expect( mongo.isDirectory( rootId )).to.eventually.be.true;
        });

        it( 'should resolve with false if resource a mimeType of anything else', function() {
            return expect( mongo.isDirectory( 'TEST-GUID-test.txt' )).to.eventually.be.false;
        });

        it( 'should reject with INVALID_RESOURCE for an invalid resource', function() {
            return expect( mongo.isDirectory( 'DOES-NOT-EXIST' )).to.be.rejectedWith( 'INVALID_RESOURCE' );
        });
    });

    // TODO test .update()

    // TODO test flags
    describe( '.alias()', function() {
        it( 'should resolve with guid for a valid resource', function() {
            return expect( mongo.alias( 'level1/level2/level3/test.txt', rootId )).to.eventually.equal( testGuidPrefix + 'test.txt' );
        });

        it( 'should reject with INVALID_RESOURCE for an invalid resource', function() {
            return expect( mongo.alias( 'level1/level2/level3/notExist.txt', rootId )).to.be.rejectedWith( 'INVALID_RESOURCE' );
        });
    });

    // TODO test file creation
    // TODO test errors
    // TODO test flags
    describe( '.create()', function() {
        it( 'should create the file record and resolve', function() {
            const parentId = rootId;
            const mimeType = 'folder';
            const name = 'media';
            const size = 100;
            const id = 'NEW-GUID';
            return mongo.create( parentId, id, mimeType, name, size )
            .then( file => {
                expect( file ).to.have.property( '_id' );
                expect( file ).to.have.property( 'mimeType' );
                expect( file ).to.have.property( 'size' );
                expect( file ).to.have.property( 'dateCreated' );
                expect( file ).to.have.property( 'lastModified' );
                expect( file ).to.have.property( 'parents' );
                expect( file ).to.have.property( 'name' );

                expect( file._id ).to.equal( id );
                expect( file.mimeType ).to.equal( mimeType );
                expect( file.size ).to.equal( size );
                expect( file.dateCreated ).to.be.an.instanceOf( Date );
                expect( file.lastModified ).to.be.an.instanceOf( Date );
                expect( file.parents ).to.deep.equal([parentId]);
                expect( file.name ).to.equal( name );
            });
        });
    });

    // TODO test errors
    // TODO test flags
    describe( '.destroy()', function() {
        it( 'should destroy the resource', function() {
            return mongo.destroy( 'TEST-GUID-test.txt' )
            .then(() =>
                expect( File.findOne({ _id: 'TEST-GUID-test.txt' }).exec()).to.eventually.be.null
            );
        });

        it( 'should destroy all children resources', function() {
            return mongo.destroy( 'TEST-GUID-level3' )
            .then(() => Promise.all([
                expect( File.findOne({ _id: 'TEST-GUID-level3' }).exec()).to.eventually.be.null,
                expect( File.findOne({ _id: 'TEST-GUID-test.txt' }).exec()).to.eventually.be.null,
            ]));
        });

        it( 'should resolve with an array of destroyed resources', function() {
            return expect( mongo.destroy( 'TEST-GUID-level2' )).to.eventually.deep.equal([
                'TEST-GUID-test.txt',
                'TEST-GUID-level3',
                'TEST-GUID-level2',
            ]);
        });
    });

    // TODO refactor
    describe.skip( '.copy()', function() {
        // rootId, old path, new path
        const oldPath = '/level1/level2/level3/test.txt';
        const newPath = '/copylevel/copy.txt';
        let oldFile;
        it( 'should respond with success on a successful copy', function() {
            return expect( mongo.copy( rootId, oldPath, newPath )).to.eventually.have.property( 'status', 'SUCCESS' );
        });
        it( 'the old file should still exist', function() {
            oldFile = () => {
                return expect( File.findOne({ name: oldPath }).exec()).to.not.be.null;
            };
        });
        it( 'the file should exist at the new path with the same metaDataId', () => {
            return expect( File.findOne({ name: newPath }).exec()).to.eventually.have.property( 'metaDataId', oldFile.metaDataId );
        });
    });

    // TODO refactor
    describe.skip( '.move()', function() {
        // a rename is also a move
        // rootId, old path, new path
        const oldPath = '/level1/level2/level3/test.txt';
        const newPath = '/movelevel/move.txt';
        let oldFile;

        it( 'should respond with success on a successful move', function() {
            return expect( mongo.move( rootId, oldPath, newPath )).to.eventually.have.property( 'status', 'SUCCESS' );
        });

        it( 'the old file should not exist', function() {
            oldFile = () => {
                return expect( File.findOne({ name: oldPath }).exec()).to.eventually.be.null;
            };
        });

        it( 'the file should exist at the new path with the same metaDataId', function() {
            return expect( File.findOne({ name: newPath }).exec()).to.eventually.have.property( 'metaDataId', oldFile.metaDataId );
        });
    });
});
