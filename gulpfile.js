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

const build = () => {
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(project())

	gulp.src('src/**/*.js').pipe(gulp.dest(out))
	gulp.src('src/**/*.json').pipe(gulp.dest(out))
	return tsCompile.pipe(gulp.dest(out))

}

const clean = () => {
	return del([`${out}/**/*.*`])
}

exports.default = gulp.series(gulp.parallel(clean, lint), build)