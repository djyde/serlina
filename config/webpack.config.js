const path = require('path')

module.exports = ({
  baseDir,
  pages = {}
} = {}) => {
  return {
    entry: pages,
    output: {
      filename: '[name].js',
      path: path.resolve(baseDir, '.celina'),
      library: {
        commonjs: '__celina'
      },
      globalObject: 'this',
      libraryTarget: 'umd'
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: "ts-loader", options: {
          configFile: path.resolve(baseDir, './tsconfig.json')
        } }
      ]
    }
  }
}
