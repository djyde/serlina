import { SerlinaInstanceOptions } from "../serlina";
import 'push-if'
const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const merge = require('webpack-merge')
const AssetsWebpackPlugin = require('assets-webpack-plugin')
const WebpackBar = require('webpackbar')
const WFP = require('write-file-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
import * as fs from 'fs'
const SerlinaLoader = require.resolve('./serlina-loader')

const noop = () => {}

export interface MakeWebpackConfigOptions extends SerlinaInstanceOptions {
  customConfig?: any,
  baseDir: string,
  outputPath: string,
  publicPath: string,
  plugins?: any[],
  dev: boolean,
  __testing?: boolean,
  pages: string[],
  onFinishedClientSideCompilation?: () => void
}

export default (options: MakeWebpackConfigOptions) => {

  const {
    customConfig,
    baseDir,
    outputPath,
    publicPath,
    serlinaConfig,
    dev,
    pages,
    __testing,
    onFinishedClientSideCompilation,
  } = options

  const entries = {}
  
  pages.forEach(page => {
    entries[page.split('.').slice(0, -1).join('.')] = './pages/' + page
  })

  const assetsWebpackPlugin = new AssetsWebpackPlugin({
    path: outputPath,
    filename: 'assetsmap.json',
    fullPath: false
  })

  const babelLoader = {
    loader: 'babel-loader',
    options: {
      root: baseDir,
      configFile: fs.existsSync(path.resolve(baseDir, './babel.config.js')) ? path.resolve(baseDir, './babel.config.js') :  path.resolve(__dirname, '../../babel.config.js')
    }
  }

  // struct webpack config
  let defaultCommonConfig = {
    mode: dev ? 'development' : 'production',
    context: baseDir,
    devtool: false,
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
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
          test: /\.jsx?$/,
          exclude: /(node_modules)/,
          use: [
            babelLoader
          ]
        },
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)/,
          use: [
            babelLoader,
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(baseDir, './tsconfig.json')
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
      new MiniCssExtractPlugin({
        filename: dev ? '[name].css' : '[name]-[chunkhash].css'
      }),
    ]
      .pushIf(dev, new webpack.NamedModulesPlugin())
  }

  const passedOptions = {
    miniCSSLoader: MiniCssExtractPlugin.loader,
    dev,
    merge: merge.smart,
    __testing: __testing,
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

  const reporter = {
    done (context) {
      console.log('done')
    }
  }

  const clientSide = merge.smart({
    entry: {
      ...entries,
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
      libraryTarget: 'umd',
      hotUpdateChunkFilename: 'hot/hot-update.js',
      hotUpdateMainFilename: 'hot/hot-update.json'
    },
    plugins: [
      new WebpackBar({
        name: 'client side',
        minimal: !dev,
        color: 'green',
        done: onFinishedClientSideCompilation || noop,
      })
    ]
    .pushIf(!dev, assetsWebpackPlugin)
    ,
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
      new WFP(),
      new WebpackBar({
        name: 'server side',
        color: 'orange',
        minimal: !dev,
        done(stats) {
          console.log(stats)
        }
      })
    ]
  }, serverSideConfig)

  const vendors = merge.smart({
    entry: {
      '_SERLINA_VENDOR': [
        require.resolve('@babel/polyfill'),
        path.resolve(__dirname, '../client/common'),
      ],
    },
    output: {
      filename: dev ? '[name].js' : '[name]-[chunkhash].js',
      path: outputPath,
      publicPath,
    },
    plugins: [
    ]
    .pushIf(!dev, assetsWebpackPlugin)
  }, clientSideConfig)

  return [
    serverSide,
    clientSide,
    vendors
  ]
}