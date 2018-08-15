import * as React from 'react'
import * as serialize from 'serialize-javascript'
export interface DocumentProps {
  pageStyles: string[],
  pageScripts: string[],
  initialProps: any,
  publicPath: string,
  children?: React.ReactNode,
  helmet: any,
  body: string,
  pageName: string,
}

export default ({
  pageStyles,
  pageScripts,
  initialProps = {},
  publicPath,
  body,
  pageName,
  helmet
}: DocumentProps) => {

  const scripts = [...pageScripts]
  
  const main = scripts.pop()
  const vendors = scripts.pop()
  const otherScripts = scripts

  return (
    <html {...helmet.htmlAttributes.toComponent()}>
      <head>
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
        {pageStyles.map(url => {
          return <link key={url} rel='stylesheet' href={publicPath + url} />
        })}
        { <script src={publicPath + vendors}></script>}
        <script dangerouslySetInnerHTML={{
          __html: `
        window.__serlina__DATA = {};
        window.__serlina__DATA.pageInitialProps = ${serialize(initialProps)};
      `
        }}>
        </script>
      </head>
      <body {...helmet.bodyAttributes.toComponent()}>
        <div id="app" dangerouslySetInnerHTML={{ __html: body }} />
        {otherScripts.map(script => {
          return <script key={script} src={publicPath + script}></script>
        })}
        { <script src={publicPath + main}></script>}
      </body>
    </html>
  )
}