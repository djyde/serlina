import * as path from 'path'
import { getOptions } from 'loader-utils'

function Loader (content, map, meta) {
  const options = getOptions(this)
  if (this.context.match(path.resolve(options.baseDir, './page'))) {
    return `
      const { hot } = require('react-hot-loader')
      ${content}
      if (module.hot && module.exports.default) {
        exports.default = hot(module)(module.exports.default)      
      }
    `
  } else {
    return content
  }
}

export default Loader
