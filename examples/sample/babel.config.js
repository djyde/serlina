module.exports = function (api) {
  api.cache(true)

  return {
    extends: require.resolve('serlina/babel.config.js')
  }
}