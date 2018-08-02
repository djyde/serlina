const webpack = require('webpack')
const makeWebpackConfig = require('./config/webpack.config')
const fs = require('fs')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const React = require('react')

const Document = require('./components/Document')
class Celina {

  constructor({
    baseDir = '',
    outputPath = path.resolve(baseDir, '.celina'),
    publicPath = '/',
    dev = true
  } = {}) {
    this.options = {
      baseDir,
      dev,
      outputPath,
      publicPath
    }
  }

  prepare () {
    const pagesPath = path.resolve(this.options.baseDir, './page')
    const pageFileNames = fs.readdirSync(pagesPath)
    const pages = {}
    pageFileNames.forEach(filename => {
      const pageName = filename.split('.').slice(0, -1).join('.')
      pages[pageName] = path.resolve(this.options.baseDir, './page', filename)
    })

    const webpackConfig = makeWebpackConfig({
      ...this.options,
      pages,
    })

    return new Promise((res, rej) => {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          // Handle errors here
          rej(err || stats.toString({ colors: true }))
        }
        this.stats = stats.toJson({
          assets: true
        })
        res(stats.toString({ colors: true }))
      })  
    })
  }

  render (pageName) {
    const page = require(path.resolve(this.options.outputPath, pageName + '.js'))
    const string = '<!DOCTYPE html>' + ReactDOMServer.renderToString(React.createElement(Document, { assets: this.stats.assets }, React.createElement(page.default)))

    return {
      string
    }
  }
}

module.exports = Celina
