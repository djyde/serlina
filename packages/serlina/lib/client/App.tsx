import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'

setConfig({ logLevel: 'debug' })

console.log('??')

declare var window: any

const Component = window.__serlina.default

const App = () => {
  return <Component {...window.__serlina__DATA.pageInitialProps} />
}

declare var module: any

if (module.hot) {
  module.hot.check({
    onAccepted(info) {
      console.log(info)
    }
  })
}

export default App
