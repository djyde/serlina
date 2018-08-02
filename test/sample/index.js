const Celina = require('../..')
const path = require('path')

const http = require('http')

const app = new Celina({
  baseDir: path.resolve(__dirname, './')
})

app.prepare()
  .then(stats => {
    const rendered = app.render('page1')
    console.log(rendered)
    // const server = http.createServer((req, res) => {
    //   res.writeHead(200, {'Content-Type': 'text/html'});
    //   res.write(rendered.string)
    //   res.end()
    // })
    // server.listen(8080)
  })
  .catch(console.error)