import * as React from 'react'

export interface DocumentProps {
  pageStyles: {name: string}[],
  pageScripts: {name: string}[],
  initialProps: any,
  publicPath?: string,
  children?: React.ReactNode,
  helmet: any,
  body: string
}

export default ({
  pageStyles,
  pageScripts,
  initialProps = {},
  publicPath = '/',
  body,
  helmet
}: DocumentProps) => {
  const scripts = pageScripts.map(script => publicPath + script.name).concat([
    publicPath + 'main.js',
  ])

  const styles = pageStyles.map(style => publicPath + style.name).concat([
  ])

  return (
    <html {...helmet.htmlAttributes.toComponent()}>
      <head>
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
        {styles.map(style => {
          return <link key={style} rel='stylesheet' href={style} />
        })}
        <script src={publicPath + 'vendors.js'}></script>
        <script dangerouslySetInnerHTML={{
          __html: `
        window.__serlina__DATA = {};
        window.__serlina__DATA.pageInitialProps = ${JSON.stringify(initialProps)};
      `.replace(/\s/g, '')
        }}>
        </script>
      </head>
      <body {...helmet.bodyAttributes.toComponent()}>
        <div id="app" dangerouslySetInnerHTML={{ __html: body }} />
        {scripts.map(script => {
          return <script key={script} src={script}></script>
        })}
      </body>
    </html>
  )
}