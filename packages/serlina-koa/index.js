const assert = require('assert')

const handler = (options = {}) => {
  return async ctx => {
    const {
      serlina,
      map
    } = options

    assert(serlina, 'Serlina instance is required!')

    if (map && map[ctx.path]) {
      const rendered = await serlina.render(map[ctx.path])
      ctx.body = rendered.string
    }
  }
}

module.exports = handler