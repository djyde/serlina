const React = require('react')

module.exports = ({
  pageName,
  children,
  initialProps = {},
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

  const Body = React.createElement('body', {}, React.createElement('script', {
    dangerouslySetInnerHTML: {
      __html: `
        window.__serlina__DATA = {};
        window.__serlina__DATA.pageInitialProps = ${JSON.stringify(initialProps)};
      `.replace(/\s/g, '')
    }
  }), children, Scripts)

  return React.createElement('html', {}, Head, Body)
}