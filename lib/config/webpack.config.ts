import { SerlinaInstanceOptions } from "../serlina";
import 'push-if'
const path = require('path')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WFP = require('write-file-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const merge = require('webpack-merge')
const AssetsWebpackPlugin = require('assets-webpack-plugin')
const WebpackBar = require('webpackbar')

export interface MakeWebpackConfigOptions extends SerlinaInstanceOptions {
  customConfig?: object,
  baseDir: string,
  outputPath: string,
  publicPath: string,
  dev: boolean,
  pages: { [pageName: string]: string }
}

export default (options: MakeWebpackConfigOptions) => {

  const {
    customConfig = {},
    baseDir,
    outputPath,
    publicPath,
    dev,
    pages = {}
  } = options

  const assetsWebpackPlugin = new AssetsWebpackPlugin({
    path: outputPath,
    filename: 'assetsmap.json',
    fullPath: false
  })

  const common = merge.smart({
    context: baseDir,
    mode: dev ? 'development' : 'production',
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"]
    },
    resolveLoader: {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        'node_modules',
      ]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            configFile: path.resolve(baseDir, './tsconfig.json')
          },
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env', 'react'],
              plugins: ['transform-regenerator']
            }
          }
        },
        {
          test: /\.css$/,
          exclude: /(node_modules)/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 1 } }
          ]
        }
      ]
    },
    plugins: [
      new WFP({
        test: /(\.js$)/
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new FriendlyErrorsWebpackPlugin()
    ]
      .pushIf(!dev, assetsWebpackPlugin)
      .pushIf(!dev, new WebpackBar())
  }, customConfig)

  return [{
    entry: pages,
    output: {
      filename: dev ? '[name].js' : '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
      library: '__serlina',
      globalObject: 'this',
      libraryTarget: 'umd'
    },
    ...common
  },
  {
    entry: {
      main: [path.resolve(__dirname, '../client/render')],
      vendors: ['babel-polyfill', 'react', 'react-dom', 'react-helmet']
    },
    output: {
      filename: dev ? '[name].js': '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
    },
    ...common
  }
  ]
}