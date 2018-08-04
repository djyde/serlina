import React from 'react'
import '../style/index.less'
import Head from '../../../head'

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
        <button onClick={e => alert('works')}>test</button>
        {this.props.foo}
      </div>
    )
  }
}