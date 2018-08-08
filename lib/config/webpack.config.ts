import { SerlinaInstanceOptions } from "../serlina";
import 'push-if'
const path = require('path')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const merge = require('webpack-merge')
const AssetsWebpackPlugin = require('assets-webpack-plugin')
const WebpackBar = require('webpackbar')
const WFP = require('write-file-webpack-plugin')

export interface MakeWebpackConfigOptions extends SerlinaInstanceOptions {
  customConfig?: object,
  baseDir: string,
  outputPath: string,
  publicPath: string,
  plugins: any[],
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
    plugins,
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
      ...plugins,
      new WFP(),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new FriendlyErrorsWebpackPlugin()
    ]
      .pushIf(!dev, assetsWebpackPlugin)
      .pushIf(!dev, new WebpackBar())
  }, customConfig)

  return [merge.smart({
    entry: {
     ...pages,
      '_SERLINA_MAIN': path.resolve(__dirname, '../client/render')
    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom'
    },
    output: {
      filename: dev ? '[name].js' : '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
      library: '__serlina',
      globalObject: 'this',
      libraryTarget: 'umd'
    },
  }, common),

  merge.smart({
    entry: {
      '_SERLINA_VENDOR': [
        'babel-polyfill',
        path.resolve(__dirname, '../client/common')
      ]
    },
    output: {
      filename: dev ? '[name].js' : '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
    }
  }, common)
  ]
}