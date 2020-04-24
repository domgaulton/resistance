import React, { Component } from 'react';
import { ContextTavernConsumer } from "../../context/ContextFirebaseTavernProvider";

class TavernCountdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percentLeft: 100,
      pausedAt: '',
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.countdownActive !== prevProps.countdownActive) {
      this.props.setCountdownActive(this.props.countdownActive);
      if (this.props.countdownActive === true) {
        this.handleStartTimer();
      } else {
        this.handleStopTimer();
      }
    }

    if (this.props.paused !== prevProps.paused) {
      if ( this.props.countdownActive ) {
        if (this.props.paused ) {
          // console.log('pause')
          this.handlePauseTimer();
        } else {
          // console.log('resume')
          this.handleStartTimer();
        }
      } else {
        this.handleStopTimer();
      }
    }
  }

  componentWillUnmount() {
    this.handleStopTimer();
  }

  handleStartTimer = () => {
    const countdownVariable = (this.props.countdownTime / 1.428);
    let tempCountdownTime = this.props.countdownTime;
    if (this.state.pausedAt !== '') {
      tempCountdownTime = this.percentageToTime(this.state.pausedAt)
    }
    this.timerId = setInterval(() => {
      if (tempCountdownTime <= 0 ) {
        clearInterval(this.timerId);
        this.setState({
          percentLeft: 100,
        })
        this.props.setCountdownActive(false);
      } else if ( this.props.countdownActive === true && tempCountdownTime !== 0 ) {
        tempCountdownTime = tempCountdownTime - (countdownVariable / 1000);
        const percent = (tempCountdownTime / this.props.countdownTime) * 100;
        this.setState({
          percentLeft: percent,
        })
      } else {
        this.setState({
          percentLeft: 100,
        })
      }
    }, countdownVariable)
  }

  handlePauseTimer = () => {
    if (this.timerId){
      clearInterval(this.timerId);
      this.setState({
        pausedAt: this.state.percentLeft,
      })
    }
  }

  handleStopTimer = () => {
    if (this.timerId){
      clearInterval(this.timerId);
      this.props.setCountdownActive(false);
      this.setState({
        percentLeft: 100,
      })
    }
  }

  percentageToTime = percentage => {
    return ((percentage / 100) * this.props.countdownTime).toFixed(2);
  }

  render(){
    return (
      <div className="countdown-timer">
        <p>{this.props.paused ? this.percentageToTime(this.state.pausedAt) : this.percentageToTime(this.state.percentLeft)}</p>
      </div>
    )
  };
}

const TavernCountdownUpdate = props => (
  <ContextTavernConsumer>
    {({ setCountdownActive }) => (
      <TavernCountdown
        {...props}
        setCountdownActive={setCountdownActive}
      />
    )}
  </ContextTavernConsumer>
);

export default TavernCountdownUpdate;

