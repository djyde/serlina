module.exports = {
  webpack(webpack, { miniCSSLoader }) {
    return {
      module: {
        rules: [{
          test: /\.less$/,
          use: [miniCSSLoader, {
            loader: 'css-loader' // translates CSS into CommonJS
          }, {
            loader: "less-loader",
            options: {
              javascriptEnabled: true
            }
          }]
        }]
      }
    }
  }
}
