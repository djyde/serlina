let h;

if (typeof window !== 'undefined') {
  const { Helmet } = require('react-helmet')
  h = Helmet
} else {
  const { Helmet } = require('react-helmet')
  h = Helmet
}

export default h