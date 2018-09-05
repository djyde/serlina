export default function (content) {
  return `
    const { hot } = require('react-hot-loader')
    ${content}
    exports.default = hot(module)(module.exports.default)
  `
}