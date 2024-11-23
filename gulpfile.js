import gulp from 'gulp'
import { deleteAsync } from 'del'
import gulpSass from 'gulp-sass'
import * as sassCompiler from 'sass'
import gulpTs from 'gulp-typescript'
import mergeStream from 'merge-stream'
import path from 'path'
import through2 from 'through2'

const tsDefaultReporter = gulpTs.reporter.defaultReporter()
const cwd = process.cwd()
const distDir = path.join(cwd, './dist')
const sass = gulpSass(sassCompiler)

// const tsConfig = require(path.join(cwd,'./tsconfig.json'))

function transform() {
  console.log('Applying Transformation...')
  return through2.obj((file, encoding, next) => {

    if (file.isBuffer()) {
      console.log('Transforming:', file.path)
      // Replace .scss references with .css in the file contents
      const updatedContent = file.contents.toString().replace(/\.scss/g, '.css')
      file.contents = Buffer.from(updatedContent)
    }
    next(null, file) // Pass the transformed file
  })
}

function compileScss() {
  console.log('Compiling SCSS w/ Sass...')
  return gulp.src(['./src/**/*.scss']).pipe(sass({
    silenceDeprecations: ['legacy-js-api']
  })).pipe(gulp.dest(distDir))
}

function compileAssets() {
  return gulp.src(['./src/**/*.@(png|svg|jpg|ico)']).pipe(gulp.dest(distDir))
}

function compileTypescript() {
  const tsSource = ['./src/**/*.{ts,tsx}', '!src/test/*.{ts,tsx}', './src/typings/**/*.d.ts']
  const jsSource = ['./src/**/*.{js,jsx}']
  let error = 0

  console.log('Compiling TypeScript...')
  const tsProject = gulpTs.createProject(path.join(cwd, './tsconfig.json'))

  // Compile TypeScript
  const tsResult = gulp.src(tsSource).pipe(
    tsProject({
      error(e) {
        tsDefaultReporter.error(e)
        error = 1
      },
      finish: tsDefaultReporter.finish,
    })
  )

  // Error handling
  function check() {
    if (error) {
      process.exit(1)
    } else {
      console.log('TypeScript compilation successful!')
    }
  }

  tsResult.on('finish', check)
  tsResult.on('end', check)

  return mergeStream([
    // Process TypeScript output with Babel and custom transformations
    tsResult.js.pipe(transform()).pipe(gulp.dest(distDir)),

    // Copy TypeScript declaration files
    tsResult.dts.pipe(gulp.dest(distDir)),
  ])
}

function cleanDist() {
  return deleteAsync(['./dist/**/*'], { force: true })
}

const build = gulp.series(cleanDist, gulp.parallel([compileAssets, compileScss, compileTypescript]))
export default build
