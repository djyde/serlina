import { hydrate } from 'react-dom'

declare var window: any

hydrate(window.__celina.default(), document.querySelector('#app'))
