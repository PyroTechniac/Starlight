/* eslint-disable */

const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const gulpIf = require('gulp-if');
const eslint = require('gulp-eslint');
const path = require('path');
const out = 'dist/'

const isFixed = file => file.eslint != null && file.eslint.fixed

const project = ts.createProject('tsconfig.json');
const lint = () => {
	return gulp.src('src/**/*.ts')
		.pipe(eslint({ fix: true }))
		.pipe(gulpIf(isFixed, gulp.dest('src')))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
}

const transpile = () => {
	return gulp.src('src/**/*.ts')
		.pipe(project())
		.pipe(gulp.dest(out))

}

const moveJson = () => {
	return gulp.src(['src/**/*.js', 'src/**/*.json']).pipe(gulp.dest(out))
}

const clean = () => {
	return del([out])
}

const fix = gulp.parallel(clean, lint);
exports.build = gulp.series(fix, moveJson, transpile)
exports.fix = fix;