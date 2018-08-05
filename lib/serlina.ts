import 'babel-polyfill'
const webpack = require('webpack')
import makeWebpackConfig, { MakeWebpackConfigOptions } from './config/webpack.config'
import * as fs from 'fs'
import * as ReactDOMServer from 'react-dom/server'
import * as path from 'path'
import * as React from 'react'
const WDS = require('webpack-dev-server')
import Document from './components/Document'
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

import { Helmet } from 'react-helmet'
// @ts-ignore
global.Helmet = Helmet

import Head from './components/Head'

const DEV_SERVER_HOST = '127.0.0.1'
const DEV_SERVER_PORT = 3000

const noCacheRequire = (pkg) => {
  delete require.cache[pkg]
  return require(pkg)
}

export interface SerlinaOptions {
  baseDir: string,
  outputPath?: string,
  publicPath?: string,
  dev?: boolean,
  forceBuild?: boolean
}

export interface SerlinaInstanceOptions extends SerlinaOptions {
  serlinaConfig: any,
  outputPath: string,
  publicPath: string,
  dev: boolean,
}

class Serlina {

  private resolveOutput;
  private options: SerlinaInstanceOptions;
  private _injectedPayload = {}
  private stats;
  private assetsMap;

  static _makeDefualtOptions = (options: SerlinaOptions): SerlinaInstanceOptions => {

    let {
      baseDir = '',
      // @ts-ignore
      outputPath = path.resolve(baseDir, '.serlina'),
      dev = true,
      // @ts-ignore
      publicPath = '/',
      forceBuild = false
    } = options

    if (dev) {
      publicPath = 'http://' + DEV_SERVER_HOST + ':' + DEV_SERVER_PORT + '/'
    }

    return {
      baseDir,
      dev,
      serlinaConfig: fs.existsSync(path.resolve(baseDir, './serlina.config.js')) ? require(path.resolve(baseDir, './serlina.config.js')) : {},
      outputPath,
      publicPath,
      forceBuild
    }
  }

  static _getPageEntries = (options: SerlinaOptions): { [x: string]: string } => {
    const pagesPath = path.resolve(options.baseDir, './page')
    const pageFileNames = fs.readdirSync(pagesPath)
    const pages = {}

    pageFileNames.forEach(filename => {
      // remove the extensions
      const pageName = filename.split('.').slice(0, -1).join('.')
      pages[pageName] = [path.resolve(options.baseDir, './page', filename)]
    })

    return pages
  }

  static _makeWebpackConfig = (options: SerlinaInstanceOptions) => {
    return makeWebpackConfig({
      ...options,
      pages: Serlina._getPageEntries(options),
      customConfig: options.serlinaConfig.webpack ? options.serlinaConfig.webpack(webpack, {
        miniCSSLoader: MiniCssExtractPlugin.loader
      }) : {}
    })
  }

  constructor(options: SerlinaOptions) {
    this.options = Serlina._makeDefualtOptions(options)
    this.resolveOutput = (...args) => path.resolve.call(null, this.options.outputPath, ...args)
  }

  prepare() {

    if (this.options.dev !== true) {
      if (this.options.forceBuild === false) {
        if (!fs.existsSync(this.resolveOutput('./assetsmap.json'))) {
          throw new Error('assetsmap.json is not found. Do you forget running `serlina build`?')
        }

        this.assetsMap = require(this.resolveOutput('./assetsmap.json'))

        return Promise.resolve()
      } else {
        // TODO: force build
      }
    }

    const webpackConfig = Serlina._makeWebpackConfig(this.options)

    return new Promise((res, rej) => {
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          // Handle errors here
          rej(err || stats.toString({
            colors: true
          }))
        }
        this.stats = stats.toJson({
          assets: true
        })

        if (this.options.dev === true) {

          const devServerOptions = {
            host: DEV_SERVER_HOST,
            port: DEV_SERVER_PORT,
            quiet: true,
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

  inject(payload) {
    this._injectedPayload = payload
  }

  async render(pageName, injectedPayload) {
    if (pageName.startsWith('/')) pageName = pageName.replace('/', '')
    let page;

    if (this.options.dev) {
      try {
        page = noCacheRequire(this.resolveOutput(pageName + '.js'))
      } catch (e) {
        pageName = '_404'
        if (fs.existsSync(this.resolveOutput('./_404.js'))) {
          page = noCacheRequire(this.resolveOutput('./_404.js'))
        } else {
          page = {
            default: noCacheRequire('./components/_404')
          }
        }
      }
    } else {
      try {
        page = require(this.resolveOutput('./', this.assetsMap[pageName].js))
      } catch (e) {
        pageName = '_404'
        if (this.assetsMap['_404']) {
          page = require(this.resolveOutput('./', this.assetsMap['_404'].js))
        } else {
          page = {
            default: noCacheRequire('./components/_404')
          }
        }
      }
    }

    const initialProps = page.default.getInitialProps ? await page.default.getInitialProps(Object.assign({}, this._injectedPayload, injectedPayload)) : {}

    let pageScripts = [] as {name: string, url: string}[]
    let pageStyles = [] as {name: string, url: string}[]

    if (this.options.dev) {
      const pageAssets = this.stats.children[0].assets
      const chunks = pageAssets.filter(asset => asset.chunkNames.indexOf(pageName) !== -1)
      pageScripts = [
        { name: pageName, url: pageName + '.js' },
        { name: 'vendors', url: 'vendors.js' },
        { name: 'main', url: 'main.js' }
      ]
      pageStyles = chunks.filter(asset => asset.name.split('.').pop() === 'css').map(asset => {
        return {
          name: asset.name,
          url: asset.name
        }
      })
    } else {
      pageScripts = [
        { name: 'vendors', url: this.assetsMap['vendors'].js },
        { name: pageName, url: this.assetsMap[pageName].js },
        { name: 'main', url: this.assetsMap['main'].js }
      ]
      if (this.assetsMap[pageName].css) {
        pageStyles = [
          { name: pageName, url: this.assetsMap[pageName].css }
        ]
      }
    }

    const body = ReactDOMServer.renderToString(React.createElement(page.default, initialProps))
    const helmet = Head.renderStatic()

    const string = '<!DOCTYPE html>' + ReactDOMServer.renderToString(React.createElement(Document, {
      pageScripts,
      pageStyles,
      pageName,
      publicPath: this.options.publicPath,
      initialProps,
      body,
      helmet
    }))

    return {
      string
    }
  }
}

export default Serlina
