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

#### host

`string` Dev server host. `127.0.0.1` by default.

#### port

`number` Dev server port. `3000` by default.

#### useStream

`boolean` use `renderToNodeStream()` instead of `renderToString()`. `false` by default.

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

`Rendered` is an object contains:

- `body` The React page rendered string body. Usually send it to the client.

<p class="warning">Don't call `serlina.render()` before `prepare()` resolving.</p>

### build

Run `serlina build` manually. Return a Webpack [compiler instance](https://webpack.js.org/api/node/#compiler-instance).

## Command Line Tool

### serlina build

#### `<baseDir>`

Path to your Serlina app. Relative to `process.cwd()`.

#### others ARGv

All ARGv will pass to Serlina as options. For example:

```
serlina build ./client --publicPath /public/
```

is the same as:

```js
new Serlina({
  baseDir: path.resolve(process.cwd(), './client'),
  publicPath: '/public/'
})
```
