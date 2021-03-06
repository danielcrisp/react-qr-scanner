const gulp = require('gulp')
const fs = require('fs')
const del = require('del')
const inlineStr = require('gulp-inline-str')
const babel = require('gulp-babel')
const uglify = require('gulp-butternut')
const concat = require('gulp-concat')
const path = require('path')

const babelOptions = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'))

const paths = {
  scripts: [ 'src/index.js', 'src/getDeviceId.js', 'src/havePropsChanged.js', 'src/errors.js' ],
  worker: 'src/worker.js',
  jsQR: path.relative('./', require.resolve('jsqr')),
  destination: './lib',
}

gulp.task('clean', function() {
  return del([ paths.destination + '/*.js' ])
})

gulp.task('worker', gulp.series('clean', function() {
  return gulp
    .src([ paths.jsQR, paths.worker ])
    .pipe(concat('worker.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.destination))
}))

gulp.task('build', gulp.series('worker', function() {
  return gulp
    .src(paths.scripts)
    .pipe(inlineStr({ basePath: paths.destination }))
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.destination))
}))

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, gulp.series('build'))
})

// The default task (called when you run `gulp` from cli)
gulp.task('default', gulp.series('build'))
