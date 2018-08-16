# serlina-react-router

[![npm](https://badgen.net/npm/v/serlina-react-router)](https://npm.im/serlina-react-router)
[![downloads](https://badgen.net/npm/dm/serlina-react-router)](https://npm.im/serlina-react-router)

## Usage

```
npm i react-router-dom serlina-react-router --save
```

```js
class Home extends React.Component {

  render () {
    return (
      <div>
        <div>Home</div>
        <Switch>
          <Route path='/' exact component={Index} />
          <Route path="/about" exact component={About} />
          <Route path="/posts" exact component={Posts} />
        </Switch>
      </div>
    )
  }
}

export default withRouter(Home, {
  getUrl({ ctx }) {
    return ctx.url
  }
})
```

### options

- `getUrl: (payload) => string` should return current url
- [`basename`](https://reacttraining.com/react-router/web/api/BrowserRouter/basename-string) The base URL for all location. 

### Use with [serlina-apollo](/packages/serlina-apollo/README.md)

```js
export default withApollo(withRouter(Home, {
  getUrl({ ctx }) {
    return ctx.url
  }
}), client)
```

# License 

MIT License