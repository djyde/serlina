let h;

// @ts-ignore
if (typeof window !== 'undefined') {
  const { Helmet } = require('react-helmet')
  h = Helmet
} else {
  // global variable Helmet is pass when serlina init
  //@ts-ignore
  h = Helmet
}

export default h