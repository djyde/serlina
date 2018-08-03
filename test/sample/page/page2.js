import React from 'react'
import '../style/index.less'

export default class Page2 extends React.Component {

  static async getInitialProps ({ req }) {
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