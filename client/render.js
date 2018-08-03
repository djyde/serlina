import React from 'react'
import { hydrate } from 'react-dom'

import App from './App'

if (window.__serlina) {
  hydrate(<App />, document.querySelector('#app'))
}
