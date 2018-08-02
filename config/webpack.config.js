const path = require('path')

module.exports = ({
  baseDir,
  outputPath,
  publicPath,
  dev,
  pages = {}
} = {}) => {
  const common = {
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
  return [
    {
      entry: pages,
      output: {
        filename: '[name].js',
        path: outputPath,
        publicPath,
        library: '__celina',
        globalObject: 'this',
        libraryTarget: 'umd'
      },
      ...common
    },
    {
      entry: {
        main: path.resolve(__dirname, '../client/render')
      },
      output: {
        filename: '[name].js',
        path: outputPath,
        publicPath,
      },
      ...common
    }
  ]
}
