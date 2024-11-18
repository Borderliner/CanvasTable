const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const { merge } = require('webpack-merge')
const webpackCommon = require('./webpack.common')

const appDirectory = fs.realpathSync(process.cwd())

function getPath(dir = '') {
  return path.resolve(appDirectory, dir)
}

const PATH_SRC = getPath('src/test')
const PATH_DIST = getPath('devdist')
const MATCH_NODE_MODULES = '/node_modules/'

const pkg = require(getPath('package.json'))
const projectName = pkg.projectName

module.exports = merge(webpackCommon, {
  entry: PATH_SRC + '/test.tsx',
  output: {
    pathinfo: true,
    filename: '[name].[fullhash].js',
    path: PATH_DIST,
    chunkFilename: '[name].[fullhash].js',
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    static: {
      directory: PATH_DIST, // Changed from 'contentBase'
    },
    host: '0.0.0.0',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin({
      root: getPath(),
    }),
    new HtmlWebpackPlugin({
      title: projectName,
      filename: 'test.html',
      template: getPath('src/test/test.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
})
