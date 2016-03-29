'use strict';

const gulp = require( 'gulp' );
const mocha = require( 'gulp-mocha' );
const isparta = require( 'isparta' );
const istanbul = require( 'gulp-istanbul' );

gulp.task( 'pre-test', () => {
    return gulp.src( 'src/**/*.js' )
    .pipe( istanbul({
        instrumenter: isparta.Instrumenter,
    }))
    .pipe( istanbul.hookRequire());
});

gulp.task( 'test', ['pre-test'], () => {
    return gulp.src([
        'test/mongo.js',
        'test/s3.js',
        'test/index.js',
    ])
    .pipe( mocha())
    .pipe( istanbul.writeReports())
    .once( 'end', () => {
        process.exit();
    });
});
