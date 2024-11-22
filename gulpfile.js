import gulp from 'gulp'
import { deleteAsync } from 'del'
import gulpSass from 'gulp-sass'
import * as sassCompiler from 'sass'
import typescript from 'gulp-typescript'
import mergeStream from 'merge-stream'
import path from 'path'

const cwd = process.cwd()
const distDir = path.join(cwd, './dist')

const sass = gulpSass(sassCompiler)

function compileCss() {
  return gulp.src('src/**/*.css').pipe(sass().on('error', sass.logError)).pipe(gulp.dest(distDir))
}

// Compile TypeScript
function compileTs() {
  const tsSource = ['./src/**/*.{ts,tsx}', '!./src/test/*.{ts,tsx}', './src/typings/**/*.d.ts']
  const tsProject = typescript.createProject('./tsconfig.json')
  const tsResult = gulp.src(tsSource).pipe(tsProject())

  return mergeStream([
    // Here we apply Babel to the TypeScript compiled JavaScript
    tsResult.js.pipe(gulp.dest(distDir)),
    tsResult.dts.pipe(gulp.dest(distDir)),
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
const build = gulp.series(cleanDist, gulp.parallel(compileCss, compileTs, copyAssets))

export default build

// Watch task (to be used with a script or command line)
function watch() {
  gulp.watch('src/**/*.{css, scss}', compileCss)
  gulp.watch('src/**/*.{ts,tsx}', compileTs)
  gulp.watch('src/**/*.{png,svg,jpg,ico}', copyAssets)
}

// Export watch function for use externally
export { watch }
