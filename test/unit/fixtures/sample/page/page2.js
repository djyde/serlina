import * as React from 'react'
import '../styles/index.css'

export default class Page2 extends React.Component {

  static async getInitialProps() {
    return {
      foo: 'foo'
    }
  }

  render () {
    return <div>Page2 - {this.props.foo}</div>
  }
}