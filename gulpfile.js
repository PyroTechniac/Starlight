/* eslint-disable */

const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const out = 'dist/'

const project = ts.createProject('tsconfig.json');

const build = () => {
	del.sync([`${out}/**/*.*`])
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(project())

	tsCompile.pipe(gulp.dest(out))

	gulp.src('src/**/*.js').pipe(gulp.dest(out))
	gulp.src('src/**/*.json').pipe(gulp.dest(out))
	return Promise.resolve();
}

exports.build = build;