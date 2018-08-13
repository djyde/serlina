const path = require('path')
const Serve = require('..')

exports.command = 'start [baseDir]'
exports.description = 'Start server in prod mode'

exports.builder = {
  baseDir: {
    default: '.'
  },
  port: {
    default: 3001,
    alias: 'p'
  }
}

exports.handler = argv => {
  const {
    baseDir,
    port
  } = argv

  const serve = new Serve({
    baseDir,
    dev: false,
    publicPath: '/public/'
  })

  serve.app.listen(port, () => {
    console.log('Running at http://localhost:' + port)
  })
}