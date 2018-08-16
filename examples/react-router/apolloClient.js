import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from "apollo-cache-inmemory"
import { createHttpLink } from 'apollo-link-http'
import * as fetch from 'isomorphic-fetch'

export default (initialState = {}) => {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache().restore(initialState),
    link: createHttpLink({
      uri: 'https://w5v4jr97kz.lp.gql.zone/graphql',
      fetch
    })
  })
}
