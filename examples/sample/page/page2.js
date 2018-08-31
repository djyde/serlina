import React from 'react'
import '../style/index.less'
import Head from 'serlina/head'

import {
  Button
} from 'antd'

export default class Page2 extends React.Component {

  static async getInitialProps ({ req }) {
    return {
      foo: 'foo'
    }
  }

  render () {
    return (
      <div>
        <Head>
          <title>Page2</title>
          <meta charSet="utf8" />
        </Head>
        <Button onClick={e => alert('works')}>testf!?!</Button>
        {this.props.foo}
      </div>
    )
  }
}