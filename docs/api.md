# API

## new Serlina(options)

return `serlina` instance.

### options

> option is required when it is marked as ❗️

#### baseDir

`string`❗ An absolute path to your Serlina app.

#### dev

`boolean` dev mode.

#### outputPath

`string` the output path of Serlina built files. `path.resolve(baseDir, '.serlina')` is by default.

#### publicPath

`string` Webpack's publicPath. It works only when dev mode is `false`.

## methods

### prepare

`serlina.prepare(): Promise<void>`

- In dev mode, it will start compiling dev server and host the built files.
- In production mode, it don't have any effects. So don't worry about performance issue.

### injectPayload(payload: any)

Inject a payload which will be used by the page in `static getInitialProps()`.

### render

`serlina.render(pageName: string, payload?: any): Promise<Rendered>`

Render a page. 

- `pageName` can start with `/` or not.
- Passing `payload` can inject payload just like `serlina.injectPayload` but to specific page. It will be merge with the payload injected by `serlina.injectPayload`

<p class="warning">Don't call `serlina.render()` before `prepare()` resolving.</p>

## Command Line Tool

### serlina build

#### `<baseDir>`

Path to your Serlina app. Relative to `process.cwd()`.

#### `--outputPath`

The output path of Serlina built files. It's relative to `process.cwd()`. 

`path.resolve(baseDir, '.serlina')` is by default.

#### `--publicPath`

default: `/`

Webpack's publicPath.
