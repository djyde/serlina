import * as React from 'react'
import { Query } from 'react-apollo'
import * as gql from 'graphql-tag'

export default () => {
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
}