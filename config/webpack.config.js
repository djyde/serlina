const path = require('path')
const webpack = require('webpack')
const WFP = require('write-file-webpack-plugin')

module.exports = ({
  baseDir,
  outputPath,
  publicPath,
  dev,
  pages = {}
} = {}) => {
  const common = (hotReload) => ({
    mode: 'development',
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"],
      modules: [
        path.resolve(__dirname, '../node_modules'),
        'node_modules'
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
              plugins: [
                'transform-regenerator'
              ].concat(hotReload ? 'react-hot-loader/babel' : [])
            }
          }
        }
      ]
    },
    plugins: [
      new WFP({
        test: /(\.js$)|!(\.hot-update.js)/
      })
    ]
  })
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
      ...common()
    },
    {
      entry: {
        main: [path.resolve(__dirname, '../client/render')],
        vendors: ['babel-polyfill', 'react', 'react-dom']
      },
      output: {
        filename: '[name].js',
        path: outputPath,
        publicPath,
      },
      ...common(false)
    }
  ]
}