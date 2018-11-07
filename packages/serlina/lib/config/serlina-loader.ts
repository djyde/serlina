import * as path from 'path'
import { getOptions } from 'loader-utils'

function Loader (content, map, meta) {
  const options = getOptions(this)
  if (this.context.match(path.resolve(options.baseDir, './pages'))) {
    return `
      console.log('start here');
      ${content};
      console.log(module)
    `
  } else {
    return content
  }
}
export default Loader
