/* eslint-disable */

const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const eslint = require('gulp-eslint');
const path = require('path');
const out = 'dist/'

const project = ts.createProject('tsconfig.json');
const lint = () => {
	gulp.src('src/**/*.ts')
		.pipe(eslint({ configFile: path.join(__dirname, '.eslintrc.json') }))
		.pipe(eslint.formatEach())
		.pipe(eslint.failAfterError())
	return Promise.resolve();
}

const build = () => {
	del.sync([`${out}/**/*.*`])
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(project())

	tsCompile.pipe(gulp.dest(out))

	gulp.src('src/**/*.js').pipe(gulp.dest(out))
	gulp.src('src/**/*.json').pipe(gulp.dest(out))
	return Promise.resolve();
}



exports.default = gulp.series(lint, build)