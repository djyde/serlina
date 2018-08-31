import * as React from 'react'
import { hydrate } from 'react-dom'

import App from './App'
declare var window: any

if (window.__serlina) {
  hydrate(<App />, document.querySelector('#app'))
}

export default App
