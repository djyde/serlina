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
const merge = require('webpack-merge')
const rimraf = require('rimraf')

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
  forceBuild?: boolean,
  __testing?: boolean
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
  private chunks;
  private assetsMap

  get _pageEntries() {
    const pagesPath = path.resolve(this.options.baseDir, './page')
    const pageFileNames = fs.readdirSync(pagesPath)
    const pages = {}

    pageFileNames.forEach(filename => {
      // remove the extensions
      const pageName = filename.split('.').slice(0, -1).join('.')
      pages[pageName] = [path.resolve(this.options.baseDir, './page', filename)]
    })

    return pages
  }

  _makeWebpackConfig = (options: SerlinaInstanceOptions, plugins = [] as any[]) => {
    return makeWebpackConfig({
      ...options,
      plugins,
      pages: this._pageEntries,
      customConfig: options.serlinaConfig.webpack ? options.serlinaConfig.webpack(webpack, {
        miniCSSLoader: MiniCssExtractPlugin.loader,
        dev: options.dev,
        merge: merge.smart,
        baseDir: options.baseDir
      }) : {}
    })
  }

  constructor(options: SerlinaOptions) {
    let {
      baseDir = '',
      // @ts-ignore
      outputPath = path.resolve(baseDir, '.serlina'),
      dev = true,
      // @ts-ignore
      publicPath = '/',
      forceBuild = false,
      __testing
    } = options

    if (dev) {
      publicPath = 'http://' + DEV_SERVER_HOST + ':' + DEV_SERVER_PORT + '/'
    }

    this.options = {
      __testing,
      serlinaConfig: fs.existsSync(path.resolve(baseDir, './serlina.config.js')) ? require(path.resolve(baseDir, './serlina.config.js')) : {},
      baseDir,
      dev,
      outputPath,
      publicPath,
      forceBuild,
    }

    this.resolveOutput = (...args) => path.resolve.call(null, this.options.outputPath, ...args)
  }

  _serlinaWebpackPlugin = {
    apply: (compiler) => {
      compiler.hooks.done.tap('serlina', (stats) => {
        const statsJson = stats.toJson({
        })

        const { chunks } = statsJson
        
        if (chunks.find(chunk => chunk.id === '_SERLINA_MAIN')) {
          this.chunks = chunks
        }
      })
    }
  }

  build() {
    const webpackConfig = this._makeWebpackConfig(this.options)
    rimraf.sync(this.options.outputPath)
    return webpack(webpackConfig)
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

    const webpackConfig = this._makeWebpackConfig(this.options, [this._serlinaWebpackPlugin])

    if (this.options.dev === true && this.options.__testing !== true) {
      const devServerOptions = {
        quiet: true,

      }

      const compiler = webpack(webpackConfig)
      const devServer = new WDS(compiler, devServerOptions)

      return new Promise((res) => {
        devServer.listen(DEV_SERVER_PORT, DEV_SERVER_HOST, res)
      })
    }

    if (this.options.__testing) {
      return new Promise((res, rej) => {
        webpack(webpackConfig, (err, stats) => {
          if (err) {
            rej(err)
          }
          res(stats.toJson())
        })
      })
    }
  }

  inject(payload) {
    this._injectedPayload = payload
  }

  async render(pageName, injectedPayload) {

    if (pageName.startsWith('/')) pageName = pageName.replace('/', '')
    let page;

    if (this.options.dev) {
      if (!fs.existsSync((this.resolveOutput(pageName + '.cmd.js')))) {
        pageName = '_404'
        if (fs.existsSync(this.resolveOutput('./_404.cmd.js'))) {
          page = noCacheRequire(this.resolveOutput('./_404.cmd.js'))
        } else {
          page = {
            default: require('./components/_404')
          }
        }
      } else {
        page = noCacheRequire(this.resolveOutput(pageName + '.cmd.js'))
      }
    } else {
      if (!fs.existsSync((this.resolveOutput(pageName + '.cmd.js')))) {
        pageName = '_404'
        if (fs.existsSync(this.resolveOutput('./404.cmd.js'))) {
          page = require(this.resolveOutput('./404.cmd.js'))
        } else {
          page = {
            default: require('./components/_404')
          }
        }
      } else {
        page = require(this.resolveOutput(`./${pageName}.cmd.js`))
      }
    }

    const injected = Object.assign({}, this._injectedPayload, injectedPayload)
    const initialProps = page.default.getInitialProps ? await page.default.getInitialProps(injected) : {}

    let pageScripts = [] as string[]
    let pageStyles = [] as string[]

    if (this.options.dev) {
      const pageChunk = this.chunks.find(chunk => chunk.id === pageName)

      let files = [] as string[]


      if (pageChunk) {
        files = pageChunk.files
      } else if (pageName === '_404') {
        files = files.concat([
          '_404.js'
        ])
      }

      pageScripts = files.filter(file => file.endsWith('.js')).concat([
        '_SERLINA_VENDOR.js',
        '_SERLINA_MAIN.js'
      ])

      pageStyles = files.filter(file => file.endsWith('.css'))

    } else {
      pageScripts = [
        this.assetsMap[pageName] && this.assetsMap[pageName].js,
        this.assetsMap['_SERLINA_VENDOR'].js,
        this.assetsMap['_SERLINA_MAIN'].js
      ].filter(_ => _)
      pageStyles = this.assetsMap[pageName] && this.assetsMap[pageName].css ? [this.assetsMap[pageName].css] : []
    }

    const body = ReactDOMServer.renderToString(React.createElement(page.default, initialProps))
    if (this.options.__testing) {
      Head.canUseDOM = false
    }
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
      string,
      __injected: injected,
      __initialProps: initialProps,
      __pageScripts: pageScripts,
      __pageStyles: pageStyles,
    }
  }
}

export default Serlina
