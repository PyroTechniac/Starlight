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
	gulp.src('src/**/*.ts')
		.pipe(eslint({ fix: true }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(gulpIf(isFixed, gulp.dest('src')))
	return Promise.resolve();
}

const build = () => {
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(project())

	tsCompile.pipe(gulp.dest(out))

	gulp.src('src/**/*.js').pipe(gulp.dest(out))
	gulp.src('src/**/*.json').pipe(gulp.dest(out))
	return Promise.resolve();
}

const preBuild = () => {
	del.sync([`${out}/**/*.*`])
	return Promise.resolve();
}

exports.default = gulp.series(preBuild, lint, build)