const React = require('react')

module.exports = ({
  children,
  publicPath = '/',
  assets = []
}) => {

  const Scripts = assets.map(asset => {
    return React.createElement('script', {
      key: asset.name,
      src: publicPath + asset.name
    })
  })

  const Head = React.createElement('head', {})

  const Body = React.createElement('body', { id: 'app' }, children, Scripts)

  return React.createElement('html', {}, Head, Body)
}
