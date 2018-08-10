import * as path from 'path'
import * as webpack from 'webpack'
import makeWebpackConfig from '../config/webpack.config'
import Serlina from '../serlina'
import * as rimraf from 'rimraf'

exports.command = 'build <baseDir>'

exports.builder = {
  'baseDir': {
    description: 'baseDir. Relative to process.cwd()'
  },
  'outputPath': {
    description: 'assets file output path.'
  },
  'publicPath': {
    description: 'publicPath in webpack. Set it if you use CDN'
  }
}

exports.handler = argv => {

  const app = new Serlina(argv)

  const compiler = app.build()
  compiler.run()
}