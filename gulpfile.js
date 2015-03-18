/*=============================================
=            Gulp Starter by @dope            =
=============================================*/

var gulp         = require('gulp');
var sass         = require('gulp-ruby-sass');
var sourcemaps   = require('gulp-sourcemaps');
var browserSync  = require('browser-sync');
var open         = require('gulp-open');
var svgSprite    = require("gulp-svg-sprites");
var prefix       = require('gulp-autoprefixer');
var plumber      = require('gulp-plumber');
var uglify       = require('gulp-uglify');
var rename       = require("gulp-rename");
var imagemin     = require("gulp-imagemin");
var pngquant     = require('imagemin-pngquant');

gulp.task('sprites', function () {
    return gulp.src('images/*.svg')
        .pipe(svgSprite({mode: "symbols"}))
        .pipe(gulp.dest("svgs"))
        .pipe(open('svgs/symbols.html', {app: 'google chrome'}));
});

gulp.task('sass', function() {
  return sass('scss/main.scss', {
    style: 'compressed',
    sourcemap: true
  })
  .on('error', function (err) {
    console.error('Error!', err.message);
  })
  .pipe(sourcemaps.write())
  .pipe(prefix('last 2 versions', '> 1%', 'ie 9', 'Android 2', 'Firefox ESR'))
  .pipe(plumber())
  .pipe(gulp.dest('css'));
});

gulp.task('browser-sync', function() {
  browserSync.init(['css/*.css', 'js/**/*.js', 'index.html'], {
    server: {
      baseDir: './'
    }
  });
});

gulp.task('scripts', function() {
  gulp.src('js/app.js')
  // .pipe(uglify())
  .pipe(rename({
    dirname: "min",
    suffix: ".min",
  }))
  .pipe(gulp.dest('js'))
});

gulp.task('images', function () {
  return gulp.src('images/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest('images'));
});

gulp.task('default', ['sass', 'browser-sync', 'scripts', 'images', 'sprites'], function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('js/**/*.js', ['scripts']);
  gulp.watch('images/*', ['images']);
});

gulp.task('watch', ['sass', 'browser-sync', 'scripts'], function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('js/**/*.js', ['scripts']);
  gulp.watch('images/*', ['images']);
});
