const gulp = require('gulp');
const rename = require('gulp-rename');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const image = require('gulp-image');
const svgMin = require('gulp-svgmin');
const sprites = require('gulp-svgstore');
const webpack = require('webpack-stream');
const vinylNamed = require('vinyl-named');

function pug2Html() {
	return gulp.src(['./src/*.pug'])
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest('./dist/'));
}

gulp.task('html', pug2Html);

function styles() {
	return gulp.src('./src/styles/*.scss')
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(gulp.dest('./dist/styles/'));
}

gulp.task('styles', styles);

const webpackConfig = {
	resolve: {
		extensions: ['.ts', '.js']
	},
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.(js|ts)$/,
				loader: 'babel-loader',
				exclude: '/node-modules/'
			}
		]
	}
}

function scripts() {
	return gulp.src(['./src/scripts/*.ts', './src/scripts/*.js'])
		.pipe(vinylNamed())
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest('./dist/scripts/'));
}

gulp.task('scripts', scripts);

function images() {
	return gulp.src('./src/assets/img/**/*.*')
		.pipe(image())
		.pipe(gulp.dest('./dist/assets/img/'));
}

gulp.task('img', images);

function getSprite() {
	return gulp.src('./src/assets/icons/*.svg')
		.pipe(svgMin())
		.pipe(sprites())
		.pipe(rename('icons.svg'))
		.pipe(gulp.dest('./dist/assets/'));
}

gulp.task('sprites', getSprite);

function fonts() {
	return gulp.src('./src/assets/fonts/**/*')
		.pipe(gulp.dest('./dist/assets/fonts/'));
}

gulp.task('fonts', fonts);

gulp.task('compile', gulp.parallel(pug2Html, styles, scripts, images, getSprite, fonts));

gulp.task('watch', function() {
	gulp.watch(['./src/*.pug', './src/pug/**/*.pug'], pug2Html);
	gulp.watch(['./src/styles/*.scss', './src/styles/**/*.scss'], styles);
	gulp.watch(['./src/scripts/**/*.js', './src/scripts/**/*.ts'], scripts);
	gulp.watch(['./src/assets/img/**/*.*'], images);
	gulp.watch(['./src/assets/icons/*.svg'], getSprite);
	gulp.watch(['./src/assets/fonts/**'], fonts);
});

gulp.task('d', gulp.series(['compile', 'watch']));