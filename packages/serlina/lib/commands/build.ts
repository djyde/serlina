import Serlina from '../serlina'

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
    dev: false,
    ...argv
  })

  const compiler = app.build()
  compiler.run()
}