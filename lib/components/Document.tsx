import * as React from 'react'

export interface DocumentProps {
  pageStyles: {name: string, url: string}[],
  pageScripts: {name: string, url: string}[],
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

  const getScript = name => pageScripts.find(script => script.name === name)
  
  const vendors = getScript('vendors')
  const page = getScript(pageName)
  const main = getScript('main')

  return (
    <html {...helmet.htmlAttributes.toComponent()}>
      <head>
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
        {pageStyles.map(style => {
          return <link key={style.name} rel='stylesheet' href={publicPath + style.url} />
        })}
        { vendors && <script src={publicPath + vendors.url}></script>}
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
        { page && <script src={publicPath + page.url}></script> }
        { main && <script src={publicPath + main.url}></script>}
      </body>
    </html>
  )
}