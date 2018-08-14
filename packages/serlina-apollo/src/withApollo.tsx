import * as React from 'react'
import { ApolloProvider, getDataFromTree } from 'react-apollo'

export default (WrappedComponent, client) => {
  return class SerlinaApolloProvider extends React.Component<any, any> {

    static async getInitialProps(payload) {
      const c = client()

      let wrappedProps = {}

      if (WrappedComponent.getInitialProps) {
        wrappedProps = await WrappedComponent.getInitialProps(payload)
      }

      await getDataFromTree((
        <ApolloProvider client={c}>
          <WrappedComponent {...wrappedProps} />
        </ApolloProvider>
      ))
      const state = c.extract()
      return {
        initialData: state,
        wrappedProps
      }
    }

    render() {
      return (
        <ApolloProvider client={client(this.props.initialData)}>
          <WrappedComponent  {...this.props.wrappedProps} />
        </ApolloProvider>
      )
    }
  }
}