import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'

setConfig({ logLevel: 'debug' })

declare var window: any

const Component = window.__serlina.default

const App = () => {
  return <Component {...window.__serlina__DATA.pageInitialProps} />
}

export default App
