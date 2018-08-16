import Serlina from '../serlina'
import * as path from 'path'

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

  const app = new Serlina({
    ...argv,
    dev: false,
    baseDir: path.resolve(process.cwd(), argv.baseDir)
  })

  const compiler = app.build()
  compiler.run()
}