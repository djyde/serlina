import * as React from 'react'

declare var window: any

const Component = window.__serlina.default

const App = () => {
  return <Component {...window.__serlina__DATA.pageInitialProps} />
}

export default App
