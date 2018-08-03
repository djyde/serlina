import * as React from 'react'

export interface DocumentProps {
  pageStyles: {name: string}[],
  pageScripts: {name: string}[],
  initialProps: any,
  publicPath: string,
  children: React.ReactNode
}

export default ({
  pageStyles,
  pageScripts,
  initialProps = {},
  publicPath = '/',
  children
}: DocumentProps) => {
  const scripts = pageScripts.map(script => publicPath + script.name).concat([
    publicPath + 'main.js',
  ])

  const styles = pageStyles.map(style => publicPath + style.name).concat([
  ])

  return (
    <html>
      <head>
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
      <body>
        <div id="app" date-reactroot="">
          {children}
        </div>
        {scripts.map(script => {
          return <script key={script} src={script}></script>
        })}
      </body>
    </html>
  )
}