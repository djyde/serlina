import React from 'react'
import '../style/index.less'

import {
  Button
} from 'antd'

console.log(Button)
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
        <Button>Test</Button>
      </div>
    )
  }
}