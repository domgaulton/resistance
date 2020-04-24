import React, { Component } from 'react';

class Toggle extends Component {

  render(){
    return (
      <div className="toggle-switch">
        <p>I'm Ready</p>
        <label className="switch">
          <input type="checkbox" onChange={(e) => this.props.handleToggle(e)} />
          <span className="slider round"></span>
        </label>
      </div>
    );
  }
}

export default Toggle;
