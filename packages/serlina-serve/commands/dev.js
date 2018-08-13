const path = require('path')
const Serve = require('..')

exports.command = 'dev [baseDir]'
exports.description = 'Start server in dev mode'

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
    baseDir: path.resolve(process.cwd(), baseDir),
    publicPath: '/public/'
  })

  serve.serlina.prepare().then(() => {
    serve.app.listen(port, () => {
      console.log('Running at http://localhost:' + port)
    })
  })
}