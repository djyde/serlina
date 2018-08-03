const webpack = require('webpack')
const makeWebpackConfig = require('./config/webpack.config')
const fs = require('fs')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const React = require('react')
const serve = require('webpack-serve')

const Document = require('./components/Document')

const DEV_SERVER_HOST = '127.0.0.1'
const DEV_SERVER_PORT = 3000

class Serlina {

  constructor({
    baseDir = '',
    outputPath = path.resolve(baseDir, '.celina'),
    publicPath = 'http://' + DEV_SERVER_HOST + ':' + DEV_SERVER_PORT + '/',
    dev = true
  } = {}) {
    this.options = {
      baseDir,
      dev,
      outputPath,
      publicPath
    }
  }

  prepare() {
    const pagesPath = path.resolve(this.options.baseDir, './page')
    const pageFileNames = fs.readdirSync(pagesPath)
    const pages = {}

    pageFileNames.forEach(filename => {
      // remove the extensions
      const pageName = filename.split('.').slice(0, -1).join('.')
      pages[pageName] = [path.resolve(this.options.baseDir, './page', filename)]
    })

    const webpackConfig = makeWebpackConfig({
      ...this.options,
      pages,
    })

    return new Promise((res, rej) => {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          // Handle errors here
          rej(err || stats.toString({
            colors: true
          }))
        }
        this.stats = stats.toJson({})

        if (this.options.dev === true) {
          return serve({}, {
            host: DEV_SERVER_HOST,
            port: DEV_SERVER_PORT,
            config: webpackConfig,
            devMiddleware: {
              headers: {
                "Access-Control-Allow-Origin": "*",
              }
            }
          }).then((result) => {
            result.on('build-started', compiler => {
              console.log('Building...')
            })

            result.on('compiler-error', stats => {
              console.log(stats.error)
              return rej(stats.error)
            })

            result.on('build-finished', stats => {
              console.log('Building finished')
              return res(stats)
            })
          })
        } else {
          return res()
        }
      })
    })
  }

  render(pageName) {
    const page = require(path.resolve(this.options.outputPath, pageName + '.js'))

    const string = '<!DOCTYPE html>' + ReactDOMServer.renderToString(React.createElement(Document, {
      pageName,
      publicPath: this.options.publicPath
    }, React.createElement('div', {
      id: 'app',
      'data-reactroot': ''
    }, React.createElement(page.default))))

    return {
      string
    }
  }
}

module.exports = Serlina