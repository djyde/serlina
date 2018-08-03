import * as React from 'react'
import { hot, setConfig } from 'react-hot-loader';


document.addEventListener('DOMContentLoaded',function(){
  console.log(window.__DATA);
});

const App = () => {
  return <window.__serlina.default {...window.__serlina__DATA.pageInitialProps} />
}

export default hot(module)(App)