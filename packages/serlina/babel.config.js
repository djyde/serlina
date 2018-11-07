module.exports = function (api) {

  api.cache(true)
  
  const presets = [[require.resolve('@babel/preset-env'), {
    modules: false
  }], require.resolve('@babel/preset-react')]

  const plugins =  [
    require.resolve('@babel/plugin-proposal-class-properties')
  ]

  return {
    presets,
    plugins
  }
}