import { SerlinaInstanceOptions } from "../serlina";
import 'push-if'
const webpack = require('webpack')
const path = require('path')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const merge = require('webpack-merge')
const AssetsWebpackPlugin = require('assets-webpack-plugin')
const WebpackBar = require('webpackbar')
const WFP = require('write-file-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

export interface MakeWebpackConfigOptions extends SerlinaInstanceOptions {
  customConfig?: any,
  baseDir: string,
  outputPath: string,
  publicPath: string,
  plugins: any[],
  dev: boolean,
  __testing?: boolean,
  pages: { [pageName: string]: string }
}

export default (options: MakeWebpackConfigOptions) => {

  const {
    customConfig = {},
    baseDir,
    outputPath,
    publicPath,
    serlinaConfig,
    dev,
    plugins,
    pages = {},
    __testing
  } = options

  const assetsWebpackPlugin = new AssetsWebpackPlugin({
    path: outputPath,
    filename: 'assetsmap.json',
    fullPath: false
  })

  // struct webpack config
  let defaultCommonConfig = {
    mode: dev ? 'development' : 'production',
    context: baseDir,
    resolveLoader: {
      modules: [
        path.resolve(__dirname, '../../node_modules'),
        'node_modules',
      ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-2'), require.resolve('babel-preset-react')]
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
      new MiniCssExtractPlugin({
        filename: dev ? '[name].css' : '[name]-[chunkhash].css'
      }),
    ]
      .pushIf(!__testing, new FriendlyErrorsWebpackPlugin())
      .pushIf(!dev, new WebpackBar())
      .pushIf(!dev, assetsWebpackPlugin)
  }

  let commonConfig = {}
  let serverConfig = {}
  let clientConfig = {}
  const passedOptions = {
    miniCSSLoader: MiniCssExtractPlugin.loader,
    dev,
    merge: merge.smart,
    __testing: __testing,
    baseDir
  }

  if (typeof customConfig === 'function') {
    // TODO: derprecated
    console.warn('[serlina]', 'Passing function to `webpack` is deprecated. Please pass your config in separate of `common`, `client` or `server`.')
    console.log(merge.smart(defaultCommonConfig, customConfig(webpack, passedOptions)))
    commonConfig = clientConfig = serverConfig = merge.smart(defaultCommonConfig, customConfig(webpack, passedOptions))
  } else {
    commonConfig = customConfig.common ? merge.smart(defaultCommonConfig, customConfig(webpack, passedOptions)) : defaultCommonConfig
    clientConfig = customConfig.client ? merge.smart(customConfig.client(webpack, passedOptions), commonConfig) : defaultCommonConfig
    serverConfig = customConfig.server ? merge.smart(customConfig.server(webpack, passedOptions), commonConfig) : defaultCommonConfig
  }

  const clientSide = merge.smart({
    entry: {
      ...pages,
      '_SERLINA_MAIN': path.resolve(__dirname, '../client/render')
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    },
    target: 'web',
    output: {
      filename: dev ? '[name].js' : '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
      library: '__serlina',
      globalObject: 'this',
      libraryTarget: 'umd'
    },
  }, clientConfig)

  const serverSideCommon = {...serverConfig}
  // don't use custom externals in server side code
  const whitelist = [/\.(?!(?:jsx?|json)$).{1,5}$/i]
  delete serverSideCommon['externals']
  const serverSide = merge.smart({
    entry: pages,
    target: 'node',
    externals: [nodeExternals({
      whitelist: serlinaConfig.nodeExternalsWhitelist ? whitelist.concat(serlinaConfig.nodeExternalsWhitelist) : whitelist
    })],
    output: {
      filename: '[name].cmd.js',
      path: outputPath,
      publicPath,
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new WFP()
    ]
  }, serverSideCommon)

  const vendors = merge.smart({
    entry: {
      '_SERLINA_VENDOR': [
        require.resolve('babel-polyfill'),
        path.resolve(__dirname, '../client/common')
      ]
    },
    output: {
      filename: dev ? '[name].js' : '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
    },
  }, clientConfig)

  return [
    serverSide,
    clientSide,
    vendors
  ]
}