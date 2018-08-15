import * as React from 'react'
import { BrowserRouter, StaticRouter } from 'react-router-dom'

type options = {
  getUrl: (payload: any) => string,
  basename?: string
}

export default (WrappedComponent, options: options) => {
  return class WithRouter extends React.Component<any> {

    static async getInitialProps (payload) {

      const url = options.getUrl(payload)

      let wrappedComponentProps = {}

      if (WrappedComponent.getInitialProps) {
        wrappedComponentProps = await WrappedComponent.getInitialProps(payload)
      }

      return {
        wrappedComponentProps,
        url,
        context: {}
      }
    }

    render () {
      // @ts-ignore
      if (process.browser) {
        return (
          <BrowserRouter basename={options.basename}>
            <WrappedComponent {...this.props.wrappedComonentProps} />
          </BrowserRouter>
        )
      } else {
        return (
          <StaticRouter
            basename={options.basename}
            context={this.props.context}
            location={this.props.url}
          >
            <WrappedComponent {...this.props} />
          </StaticRouter>
        )
      }
    }
  }
}