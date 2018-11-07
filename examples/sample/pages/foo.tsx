import * as React from 'react'

export default class Counter extends React.Component {

  state = {
    count: 0 as number
  }

  incr = () => {
    this.setState({ count: this.state.count + 1 })
  }

  decr = () => {
    this.setState({ count: this.state.count - 1 })
  }


  render () {
    return (
      <div>
        <h2>Hot Reload Counter</h2>
        <h2>{this.state.count}</h2>
        <button onClick={this.incr}>+d</button>
        <button onClick={this.decr}>-</button>
      </div>
    )
  }
}