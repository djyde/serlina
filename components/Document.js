const React = require('react')

module.exports = ({
  pageName,
  pageStyles,
  pageScripts,
  children,
  initialProps = {},
  publicPath = '/'
}) => {
  const scripts = pageScripts.map(script => publicPath + script.name).concat([
    publicPath + 'main.js',
  ])

  const styles = pageStyles.map(style => publicPath + style.name).concat([
  ])

  const Scripts = scripts.map(script => {
    // console.log(asset)
    return React.createElement('script', {
      key: script,
      src: script
    })
  })

  const Styles = styles.map(style => {
    return React.createElement('link', {
      key: style,
      rel: 'stylesheet',
      href: style
    })
  })

  const Head = React.createElement('head', {}, Styles, React.createElement('script', {
    src: publicPath + 'vendors.js'
  }))

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