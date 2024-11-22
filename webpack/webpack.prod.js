import path from 'path'
import fs from 'fs'
import { merge } from 'webpack-merge'
import webpackCommon from './webpack.common.js'

const appDirectory = fs.realpathSync(process.cwd())

function getPath(dir = '') {
  return path.resolve(appDirectory, dir)
}

const PATH_DIST = getPath('umd')
const PATH_SRC = getPath('src')

export default merge(webpackCommon, {
  entry: PATH_SRC + '/index.ts',
  output: {
    path: PATH_DIST,
    filename: 'canvastable.min.js',
    library: 'CanvasTable',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  mode: 'production',
  plugins: [],
})
