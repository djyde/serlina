const React = require('react')

module.exports = ({
  pageName,
  children,
  publicPath = '/'
}) => {
  const scripts = [publicPath + pageName + '.js', publicPath + 'main.js']

  const Scripts = scripts.map(script => {
    // console.log(asset)
    return React.createElement('script', {
      key: script,
      src: script
    })
  })

  const Head = React.createElement('head', {})

  const Body = React.createElement('body', {}, children, Scripts)

  return React.createElement('html', {}, Head, Body)
}
