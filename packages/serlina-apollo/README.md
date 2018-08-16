# serlina-apollo

[![npm](https://badgen.net/npm/v/serlina-apollo)](https://npm.im/serlina-apollo)
[![downloads](https://badgen.net/npm/dm/serlina-apollo)](https://npm.im/serlina-apollo)

Delightful using Apollo in Serlina.

## Usage

```
npm i apollo-boost react-apollo serlina-apollo isomorphic-fetch --save
```

Create an apollo client for serlina-apollo:

```js
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from "apollo-cache-inmemory"
import { createHttpLink } from 'apollo-link-http'
import * as fetch from 'isomorphic-fetch'

const client = (initialState = {}) => {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache().restore(initialState),
    link: createHttpLink({
      uri: 'YOUR_URL',
      fetch
    })
  })
}
```

> `uri` must be an absolute URI. See [Apollo document for server-side rendering](https://www.apollographql.com/docs/react/features/server-side-rendering.html#server-initialization)


Use `<Query>` in your page or anywhere:

```js
import { Query } from 'react-apollo'
import { withApollo } from 'serlina-apollo'
import * as gql from 'graphql-tag'

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
```

# License

MIT License