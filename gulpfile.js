import gulp from 'gulp'
import { deleteAsync } from 'del'
import babel from 'gulp-babel'
import gulpSass from 'gulp-sass'
import * as sassCompiler from 'sass'
import typescript from 'gulp-typescript'
import mergeStream from 'merge-stream'
import path from 'path'
import { readFileSync } from 'fs'

const cwd = process.cwd()
const distDir = path.join(cwd, './dist')

const babelConfig = JSON.parse(readFileSync(new URL('./.babelrc', import.meta.url)))
const sass = gulpSass(sassCompiler)

// Compile JavaScript with Babel
function babelify() {
  return gulp
    .src(['src/**/*.{js,jsx}', '!src/**/*.spec.{js,jsx}']) // Exclude test files
    .pipe(babel(babelConfig))
    .pipe(gulp.dest(distDir))
}

function compileCss() {
  return gulp.src('src/**/*.css').pipe(sass().on('error', sass.logError)).pipe(gulp.dest(distDir))
}

// Compile TypeScript
function compileTs() {
  const tsProject = typescript.createProject('tsconfig.json')
  const tsResult = tsProject.src().pipe(tsProject())

  return mergeStream([
    tsResult.dts.pipe(gulp.dest(distDir)),
    // Here we apply Babel to the TypeScript compiled JavaScript
    tsResult.js.pipe(babel(babelConfig)).pipe(gulp.dest(distDir)),
  ])
}

// Copy assets
function copyAssets() {
  return gulp.src(['src/**/*.@(png|svg|jpg|ico)', '!src/**/*.spec.*']).pipe(gulp.dest(distDir))
}

// Clean the dist directory
function cleanDist() {
  return deleteAsync(['dist/**/*'], { force: true })
}

// Define task sequence
const build = gulp.series(cleanDist, gulp.parallel(compileCss, compileTs, babelify, copyAssets))

export default build

// Watch task (to be used with a script or command line)
function watch() {
  gulp.watch('src/**/*.{css, scss}', compileCss)
  gulp.watch('src/**/*.{ts,tsx}', compileTs)
  gulp.watch('src/**/*.{js,jsx}', babelify)
  gulp.watch('src/**/*.{png,svg,jpg,ico}', copyAssets)
}

// Export watch function for use externally
export { watch }
