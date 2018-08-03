import React from 'react'
import '../style/home.css'

export default class Page2 extends React.Component {

  static getInitialProps ({ req }) {
    return {
      foo: 'foo'
    }
  }

  render () {
    return (
      <div>
        {this.props.foo}
      </div>
    )
  }
}