# Plugins

A Serlina plugin means a reusable Serlina config. 

## Use a plugin

For example, an `serlina-plugin-antd` includes some webpack config for using ant.design:

```js
// serlina.config.js

const { withAntd } = require('serlina-plugin-antd')

module.exports = withAntd()
```

### Official plugins

Official plugins are managed on https://github.com/serlina-community/serlina-plugins