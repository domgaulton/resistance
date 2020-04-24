import React, { Component } from 'react';

class Buzzer extends Component {

  render(){
    return (
      <div className="buzzer">
        <button onClick={this.props.handleBuzzer} disabled={this.props.buzzerDisabled}>Buzzin'!</button>
      </div>
    );
  }
}

export default Buzzer;
