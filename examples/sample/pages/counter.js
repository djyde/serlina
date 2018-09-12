import * as React from 'react'

export default class Counter extends React.Component {

  state = {
    count: 0
  }

  incr = () => {
    this.setState({ count: this.state.count + 10 })
  }

  decr = () => {
    this.setState({ count: this.state.count - 1 })
  }


  render () {
    return (
      <div>
        <h2>Hot Reload Counter</h2>
        <h2>{this.state.count}</h2>
        <button onClick={this.incr}>+</button>
        <button onClick={this.decr}>-</button>
      </div>
    )
  }
}