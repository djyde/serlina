import * as React from 'react'

export default () => {
  const o = () => { alert('works') }
  return <div onClick={o}>Hello from page1</div>
}
