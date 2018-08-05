let h;

// @ts-ignore
if (global.Helmet) {
  // @ts-ignore
  h = global.Helmet
} else {
  const { Helmet } = require('react-helmet')
  h = Helmet
}

export default h