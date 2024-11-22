import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import { merge } from 'webpack-merge';
import webpackCommon from './webpack.common.js';

const appDirectory = fs.realpathSync(process.cwd());

function getPath(dir = '') {
  return path.resolve(appDirectory, dir);
}

const PATH_SRC = getPath('src/test');
const PATH_DIST = getPath('devdist');
const MATCH_NODE_MODULES = '/node_modules/';

const pkg = JSON.parse(fs.readFileSync(getPath('package.json'), 'utf8'));
const projectName = pkg.projectName;

export default merge(webpackCommon, {
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
      directory: PATH_DIST,
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
});
