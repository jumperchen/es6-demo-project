'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var browserify = require('browserify');
var glob = require('glob');
var es = require('event-stream');
var gulpBabel = require('gulp-babel');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var path = require('path');
var babel = require('babelify');

var paths = {
    src: 'src/**/*.js',
    dest: 'dist',
    debug: 'debug',
    // Must be absolute or relative to source map
    sourceRoot: path.join(__dirname, 'src')
};

// distribute from ES6 to ES5 for browser to use
gulp.task('dist', function (done) {
    glob(paths.src, function (err, files) {
        if (err) done(err);

        var tasks = files.map(function (entry) {
            return browserify({
                entries: [entry],
                debug: true
            }).transform(babel.configure({
                    // Use all of the ES2015 spec
                    presets: ["es2015"]
                }))
                .bundle()
                .pipe(source(entry))
                .pipe(buffer())
                .pipe(sourcemaps.init())
                // optional
                // .pipe(uglify())
                .on('error', gutil.log)
                .pipe(sourcemaps.write('./', { sourceRoot: paths.sourceRoot }))
                .pipe(rename({dirname: ''}))
                .pipe(gulp.dest(paths.dest));
        });
        es.merge(tasks).on('end', done);
    })
});

// build from ES6 to ES5 for Webstorm to debug
gulp.task('build', function () {
    return gulp.src(paths.src)
        .pipe(sourcemaps.init())
        .pipe(gulpBabel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.', { sourceRoot: paths.sourceRoot }))
        .pipe(gulp.dest(paths.debug));
});

gulp.task('watch', function() {
    gulp.watch(paths.src, ['build']);
});
gulp.task('default', ['watch']);