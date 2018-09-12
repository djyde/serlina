const assert = require('assert')
const pathToReg = require('path-to-regexp')

const handler = (options = {}) => {
  return async ctx => {
    const {
      serlina,
      map,
      payload
    } = options

    assert(serlina, 'Serlina instance is required!')

    const injected = Object.assign({}, { ctx }, payload || {})

    let renderedPath;

    if (map) {
      Object.keys(map).forEach(path => {
        const re = pathToReg(path)
        if (ctx.path.match(re)) {
          renderedPath = path
        }
      })

      if (renderedPath) {
        const rendered = await serlina.render(renderedPath, injected)
        ctx.body = rendered.body
      }
    }
  }
}

module.exports = handler