import * as React from 'react'
import { hot, setConfig } from 'react-hot-loader';

setConfig({ logLevel: 'debug' })

const App = () => {
  return <window.__serlina.default />
}

export default hot(module)(App)