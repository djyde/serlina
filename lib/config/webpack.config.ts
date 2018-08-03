const path = require('path')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WFP = require('write-file-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const merge = require('webpack-merge')

export default (options) => {

  const {
    customConfig = {},
    baseDir,
    outputPath,
    publicPath,
    dev,
    pages = {}
  } = options

  const common = merge({
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
          exclude: /(node_modules)/,
          options: {
            configFile: path.resolve(baseDir, './tsconfig.json')
          }
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
  }, customConfig)

  return [{
    entry: pages,
    output: {
      filename: '[name].js',
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
      vendors: ['babel-polyfill']
    },
    output: {
      filename: '[name].js',
      path: outputPath,
      publicPath,
    },
    ...common
  }
  ]
}