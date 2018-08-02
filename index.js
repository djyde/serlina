const webpack = require('webpack')
const makeWebpackConfig = require('./config/webpack.config')
const fs = require('fs')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const React = require('react')
class Celina {

  constructor({
    baseDir = ''
  } = {}) {
    this.options = {
      baseDir,
      builtDir: path.resolve(baseDir, '.celina')
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
      baseDir: this.options.baseDir,
      pages
    })

    return new Promise((res, rej) => {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          // Handle errors here
          rej(err || stats.toString({ colors: true }))
        }
        res(stats.toString({ colors: true }))
      })  
    })
  }

  render (pageName) {
    const page = require(path.resolve(this.options.builtDir, pageName + '.js'))
    const string = ReactDOMServer.renderToString(React.createElement(page.default))
    
    return {
      string
    }
  }
}

module.exports = Celina
