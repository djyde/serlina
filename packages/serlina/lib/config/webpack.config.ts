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
const ReactHotLoader = require.resolve('react-hot-loader/babel')
const SerlinaHotLoader = require.resolve('./serlina-hot-reload-loader')

export interface MakeWebpackConfigOptions extends SerlinaInstanceOptions {
  customConfig?: any,
  baseDir: string,
  outputPath: string,
  publicPath: string,
  plugins: any[],
  dev: boolean,
  __testing?: boolean,
  pages: string[]
}

export default (options: MakeWebpackConfigOptions) => {

  const {
    customConfig,
    baseDir,
    outputPath,
    publicPath,
    serlinaConfig,
    dev,
    plugins,
    pages,
    __testing
  } = options

  const entries = {}
  
  pages.forEach(page => {
    entries[page.split('.').slice(0, -1).join('.')] = './page/' + page
  })

  const assetsWebpackPlugin = new AssetsWebpackPlugin({
    path: outputPath,
    filename: 'assetsmap.json',
    fullPath: false
  })

  // struct webpack config
  let defaultCommonConfig = {
    mode: dev ? 'development' : 'production',
    context: baseDir,
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, '../../node_modules'),
      ]
    },
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
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-2'), require.resolve('babel-preset-react')],
                plugins: [
                  ReactHotLoader
                ]
              }
            }
          ]
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
      .pushIf(dev, new webpack.NamedModulesPlugin())
      .pushIf(!__testing, new FriendlyErrorsWebpackPlugin())
      .pushIf(!dev, new WebpackBar())
      .pushIf(!dev, assetsWebpackPlugin)
  }

  const passedOptions = {
    miniCSSLoader: MiniCssExtractPlugin.loader,
    dev,
    merge: merge.smart,
    __testing: __testing,
    ReactHotLoader,
    SerlinaHotLoader,
    baseDir
  }

  const clientSideConfig = customConfig ? merge(customConfig(webpack, {
    ...passedOptions,
    compileEnv: 'client'
  }), defaultCommonConfig) : defaultCommonConfig

  const serverSideConfig = customConfig ? merge(customConfig(webpack, {
    ...passedOptions,
    compileEnv: 'server'
  }), defaultCommonConfig) : defaultCommonConfig
  // don't use custom externals in server side code
  delete serverSideConfig['externals']

  const clientSide = merge.smart({
    entry: {
      ...entries,
      '_SERLINA_MAIN': path.resolve(__dirname, '../client/render')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: SerlinaHotLoader,
            options: {
              baseDir
            }
          },
        }
      ],
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
      libraryTarget: 'umd',
      hotUpdateChunkFilename: 'hot/hot-update.js',
      hotUpdateMainFilename: 'hot/hot-update.json'
    },
    plugins: [
    ].pushIf(dev, new webpack.HotModuleReplacementPlugin()),
  }, clientSideConfig)

  const whitelist = [/\.(?!(?:jsx?|json)$).{1,5}$/i]
  const serverSide = merge.smart({
    entry: entries,
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
  }, serverSideConfig)

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
  }, clientSideConfig)

  return [
    serverSide,
    clientSide,
    vendors
  ]
}