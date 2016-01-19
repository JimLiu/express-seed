var watchify = require('watchify'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-cssmin'),
    less = require('gulp-less'),
    gls = require('gulp-live-server');


gulp.task('server', function() {
    var options = {
        cwd: undefined
    };
    options.env = process.env;
    options.env.NODE_ENV = 'development';

    var server = gls('server/bin/www', options, 35729);
    server.start();

    gulp.watch([
            'config*.js',
            'server/bin/*',
            'server/**/*.js*'
        ], function () {
        server.start();
    });
    gulp.watch([
            'client/assets/**/*.css',
            'client/assets/**/*.js',
            'server/views/**/*.hbs'
        ], function () {
        server.notify.apply(server, arguments);
    });
});


gulp.task('styles', function() {
  return gulp.src('client/less/screen.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/assets/css'))
    .pipe(cssmin());
});

gulp.task('dev', ['styles', 'server'], function() {
    gulp.watch('client/less/**/*.less', ['styles']);
});

gulp.task('default', ['dev'], function() {
});