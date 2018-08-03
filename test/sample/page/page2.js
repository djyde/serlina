import React from 'react'

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