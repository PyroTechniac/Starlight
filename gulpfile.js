/* eslint-disable */

const gulp = require('gulp');
const ts = require('gulp-typescript');
const gulpIf = require('gulp-if');
const fsn = require('fs-nextra')
const eslint = require('gulp-eslint');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
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
	const result = project.src()
		.pipe(sourcemaps.init())
		.pipe(project())

	return merge([
		result.dts.pipe(gulp.dest('typings')),
		result.js.pipe(sourcemaps.write('.'), { sourceRoot: '../src' }).pipe(gulp.dest(out))
	])
}

const copy = () => {
	return gulp.src(['src/**/*.js', 'src/**/*.json']).pipe(gulp.dest(out))
}

const clean = () => {
	return Promise.all([
		fsn.emptyDir('dist'),
		fsn.emptyDir('typings')
	])
}

const fix = gulp.parallel(clean, lint);
exports.build = gulp.series(fix, copy, transpile)
exports.fix = fix;
exports.lint = lint;