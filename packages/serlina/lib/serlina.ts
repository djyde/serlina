import '@babel/polyfill'
const webpack = require('webpack')
import makeWebpackConfig, { MakeWebpackConfigOptions } from './config/webpack.config'
import * as fs from 'fs'
import * as ReactDOMServer from 'react-dom/server'
import * as path from 'path'
import * as React from 'react'
import * as glob from 'glob'
const WDS = require('webpack-dev-server')
import Document from './components/Document'
const rimraf = require('rimraf')

import { Helmet } from 'react-helmet'
// @ts-ignore
global.Helmet = Helmet

import Head from './components/Head'
import EventBus from './utils/eventbus';

const DEV_SERVER_HOST = '127.0.0.1'
const DEV_SERVER_PORT = 3000

const noCacheRequire = (pkg) => {
  delete require.cache[pkg]
  return require(pkg)
}

export interface SerlinaOptions {
  baseDir: string,
  outputPath?: string,
  host?: string,
  port?: number,
  publicPath?: string,
  dev?: boolean,
  forceBuild?: boolean,
  __serlinaConfig?: any,
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
  private _webpackConfig = {}
  private chunks;
  private assetsMap

  private __eventBus = new EventBus()

  get _pageEntries() {
    const pagesPath = path.resolve(this.options.baseDir, './pages')

    const pages = glob.sync('**/*.*', {
      cwd: pagesPath
    })

    return pages as string[]
  }

  _makeWebpackConfig = (onFinishedClientSideCompilation?) => {
    return makeWebpackConfig({
      ...this.options,
      onFinishedClientSideCompilation,
      pages: this._pageEntries,
      customConfig: this.options.serlinaConfig.webpack
    })
  }

  constructor(options: SerlinaOptions) {
    let {
      baseDir = '',
      host = DEV_SERVER_HOST,
      port = DEV_SERVER_PORT,
      // @ts-ignore
      outputPath = path.resolve(baseDir, '.serlina'),
      dev = true,
      // @ts-ignore
      publicPath = '/',
      forceBuild = false,
      __serlinaConfig,
      __testing
    } = options

    if (dev) {
      publicPath = 'http://' + host + ':' + port + '/'
    }

    const serlinaConfig = __serlinaConfig ? __serlinaConfig : (fs.existsSync(path.resolve(baseDir, './serlina.config.js')) ? require(path.resolve(baseDir, './serlina.config.js')) : {})

    // @ts-ignore
    this.options = {
      baseDir,
      host,
      port,
      outputPath,
      dev,
      publicPath,
      forceBuild,
      __testing,
      serlinaConfig,
    }

    this.resolveOutput = (...args) => path.resolve.call(null, this.options.outputPath, ...args)
  }

  _onFinishedClientSideCompilation = (state, ctx) => {
    const json = state['client side'].stats.toJson()
    this.chunks = json.chunks
    this.__eventBus.emit('compiled')
    json.errors.forEach(error => {
      console.log(error)
    })
  }

  build() {
    const webpackConfig = this._makeWebpackConfig(this._onFinishedClientSideCompilation)
    rimraf.sync(this.options.outputPath)
    return webpack(webpackConfig)
  }

  private async waitForChunks () {
    console.log('[serlina]', 'Waiting for compilation finish.')
    return new Promise((resolve) => {
      this.__eventBus.on('compiled', () => {
        resolve()
      })
    })
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

    const webpackConfig = this._makeWebpackConfig(this._onFinishedClientSideCompilation)

    this._webpackConfig = webpackConfig

    const [ serverSide, clientSide, vendors ] = webpackConfig

    if (this.options.dev === true && this.options.__testing !== true) {
      const devServerOptions = {
        quiet: true,
        // inline: true,
        // hot: true,
        // port: this.options.port,
        // host: this.options.host,
        // headers: {
        //   "Access-Control-Allow-Origin": "*",
        //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        //   "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        // }
      }

      // WDS.addDevServerEntrypoints(clientSide, devServerOptions)

      const compiler = webpack([ clientSide, serverSide, vendors ])
      const devServer = new WDS(compiler, devServerOptions)

      return new Promise((res) => {
        devServer.listen(this.options.port, this.options.host, () => {
          this.__eventBus.on('compiled', res)
        })
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

      if (!this.chunks) {
        await this.waitForChunks()
      }

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
      body: string,
      __webpackConfig: this._webpackConfig,
      __injected: injected,
      __initialProps: initialProps,
      __pageScripts: pageScripts,
      __pageStyles: pageStyles,
    }
  }
}

export default Serlina
