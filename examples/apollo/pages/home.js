import * as React from 'react'

import { ApolloClient } from 'apollo-client'
import { Query } from 'react-apollo'
import { InMemoryCache } from "apollo-cache-inmemory"
import { createHttpLink } from 'apollo-link-http'
import { withApollo } from 'serlina-apollo'
import * as gql from 'graphql-tag'
import * as fetch from 'isomorphic-fetch'

const client = (initialState = {}) => {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache().restore(initialState),
    link: createHttpLink({
      uri: 'https://w5v4jr97kz.lp.gql.zone/graphql',
      fetch
    })
  })
}

export default withApollo(() => {
  return (
    <div>
      <Query query={gql`
        query {
          posts {
            id,
            title
          }
        }
      `}>
        {({ loading, data }) => {
          if (loading) {
            return "loading"
          } else {
            const posts = data.posts || []
            return (
              <div>
                {posts.map(post => {
                  return <p>{post.title}</p>
                })}
              </div>
            )
          }
        }}
      </Query>
    </div>
  )
}, client)