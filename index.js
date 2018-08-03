const webpack = require('webpack')
const makeWebpackConfig = require('./config/webpack.config')
const fs = require('fs')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const React = require('react')
const serve = require('webpack-serve')
const WDS = require('webpack-dev-server')
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

          const devServerOptions = {
            host: DEV_SERVER_HOST,
            port: DEV_SERVER_PORT,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }

          const compiler = webpack(webpackConfig)
          const devServer = new WDS(compiler, devServerOptions)

          devServer.listen(DEV_SERVER_PORT, DEV_SERVER_HOST, () => {
            res()
          })

        } else {
          return res()
        }
      })
    })
  }

  inject (payload) {
    this.injectedPayload = payload
  }

  async render(pageName) {
    delete require.cache[path.resolve(this.options.outputPath, pageName + '.js')]
    const page = require(path.resolve(this.options.outputPath, pageName + '.js'))

    const initialProps = page.default.getInitialProps ? await page.default.getInitialProps(this.injectedPayload) : {}

    const string = '<!DOCTYPE html>' + ReactDOMServer.renderToString(React.createElement(Document, {
      pageName,
      publicPath: this.options.publicPath,
      initialProps
    }, React.createElement('div', {
      id: 'app',
      'data-reactroot': ''
    }, React.createElement(page.default, initialProps))))

    return {
      string
    }
  }
}

module.exports = Serlina