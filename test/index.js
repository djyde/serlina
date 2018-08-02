const Celina = require('../')
const path = require('path')

const app = new Celina({
  baseDir: path.resolve(__dirname, './sample')
})

app.prepare()
  .then(stats => {
    const rendered = app.render('page1')
  })
  .catch(console.error)