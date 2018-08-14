# Plugins

We can create reusable configs, and call it `plugins`. 

## Use a plugin

For example, an `serlina-plugin-antd` includes some webpack config for using ant.design:

```js
// serlina.config.js

const { withAntd } = require('serlina-plugin-antd')

module.exports = withAntd()
```

## Write a plugin

A plugin is just a function that return a merged config object:

```js

module.exports = (config = {}) => {
  return Object.assign({
    // your config...
  }, config)
}
```

### Official plugins

Official plugins are managed on https://github.com/serlina-community/serlina-plugins