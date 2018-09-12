import React from 'react'
import '../style/index.less'
import Head from 'serlina/head'
import {
  Button
} from 'antd'
import PrimaryButton from '../components/PrimaryButton'
import * as utils from '../utils'

class Page2 extends React.Component {

  static async getInitialProps ({ req }) {
    return {
      foo: 'foo??!'
    }
  }

  render () {
    return (
      <div>
        <Head>
          <title>Page2</title>
          <meta charSet="utf8" />
        </Head>
        <Button onClick={e => alert('works!')}>HMR!!!! Amazing!!.??. {utils.foo} </Button>
        <PrimaryButton>Hi?</PrimaryButton>
        {this.props.foo}
      </div>
    )
  }
}

export default Page2
