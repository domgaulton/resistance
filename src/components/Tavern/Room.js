import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import { ContextTavernConsumer } from "../../context/ContextFirebaseTavernProvider";
import UserList from './UserList';
import Buzzer from './Buzzer';
import Toggle from './Toggle';
import Login from '../Auth/Login';
import PageHeader from '../General/PageHeader';

class Tavern extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tavernId: '',
      tavernName: '',
      adminUser: false,
      membersReady: false,
      membersCount: 0,
      buzzedIn: '',
      countdownActive: false,
      timePercentLeft: 100,
    };
  }

  componentDidMount(){
    this.props.setTavernData(this.props.match.params.tavernId);
    this.setState({
      tavernId: this.props.match.params.tavernId,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.tavernData.members && this.props.tavernData.members !== prevProps.tavernData.members) {
      console.log(this.props.tavernData.members.length)
      const membersReady = this.props.tavernData.members.every(item => {
        return item.isReady === true;
      })
      this.setState({
        membersReady,
        membersCount: this.props.tavernData.members.length
      })
    }

    if (this.props.tavernData.countdownActive !== prevProps.tavernData.countdownActive) {
      this.setState({
        countdownActive: this.props.tavernData.countdownActive,
      })
    }

    if (this.props.tavernData.buzzedIn !== prevProps.tavernData.buzzedIn) {
      if (this.props.tavernData.buzzedIn !== ''){
        this.setState({
          buzzedIn: this.props.tavernData.buzzedIn
        })
      } else {
        this.setState({
          buzzedIn: '',
        })
      }
    }
  }

  componentWillUnmount = () => {
    if (this.props.tavernData && this.props.tavernData.members) {
      this.handleScoresAndTavernStates(this.props.tavernData.members);
    }
  }

  handleScoresAndTavernStates = members => {
    // Set and reset score
    if (members) {
      members.forEach(member => {
        // update individual scores on user collection
        this.props.updateUserData(member.id, 'score', member.score)
      })
    }
    this.props.resetTavernMembers(this.props.match.params.tavernId);
  }

  handleToggleUserReady = e => {
    this.props.setUserReady(this.props.userId, e.target.checked);
  }

  checkAdmin = () => {
    if (this.props.userId === this.props.tavernData.admin) {
      return true;
    }
  }

  checkIfMember = () => {
    if(this.props.tavernData && this.props.tavernData.members && this.props.tavernData.members.some(member => member.id === this.props.userId)){
      return true;
    }
  }
  toggleCountdown = () => {
    this.setState({
      countdownActive: !this.props.tavernData.countdownActive,
    })
  }

  handleUserBuzzer = () => {
    this.props.userBuzzedIn(this.props.userId);
  }

  handleAdjudication = (e) => {
    if (e.target.value) {
      this.props.userAnswered(e.target.value, this.state.buzzedIn);
    }
  }

  render(){
    return this.props.userLoggedIn && this.props.tavernData ? (
      <div className="container">
        <PageHeader
          title={`
            ${this.props.tavernData.name}
            ${this.checkAdmin() ? `(Pin:${this.props.tavernData.pin})` : ''}
          `}
          settings={this.checkAdmin() ? this.state.tavernId : false}
        />

        {this.checkAdmin() ? (
          <div className={`countdown-start-stop ${!this.state.membersReady ? 'countdown-start-stop--disabled' : null}`}>
            <button
              disabled={!this.state.membersReady}
              onClick={this.toggleCountdown}
            >
              <i className="material-icons">{this.state.membersCount > 5 ? 'lock' : 'lock_open'}</i>
            </button>
          </div>
        ) : (
          null // Later we might put the buzzer here as admin can't play
        )}

        <UserList />

        {this.checkAdmin() & this.state.buzzedIn !== '' ? (
          <form
            onClick={(e) => this.handleAdjudication(e)}
            className='admin-adjudication'
          >
            <div className="admin-adjudication__button">
              <label htmlFor="answerCorrect">
                <i className="material-icons text-red">close</i>
              </label>
              <input id="answerCorrect" type="radio" name="admin-adjudication" value={false} />
            </div>
            <div className="admin-adjudication__button">
              <label htmlFor="answerIncorrect">
                <i className="material-icons  text-green">check</i>
              </label>
              <input id="answerIncorrect" type="radio" name="admin-adjudication" value={true} />
            </div>
          </form>
        ) : null}

        <Buzzer handleBuzzer={this.handleUserBuzzer} buzzerDisabled={!this.state.countdownActive || this.state.buzzedIn !== ''}/>

        {!this.state.membersReady && this.checkIfMember() ?  (
          <Toggle handleToggle={this.handleToggleUserReady} />
        ) : null }

      </div>
    ) : (
      <Login />
    );
  };
}

const TavernUpdate = props => (
  <ContextUserConsumer>
    {({ userLoggedIn, userId, userData, getUserData, updateUserData }) => (
      <ContextTavernConsumer>
        {({ tavernData, setTavernData, setUserReady, setCountdownActive, userBuzzedIn, userAnswered, resetTavernMembers }) => (
          <Tavern
            {...props}
            userLoggedIn={userLoggedIn}
            userId={userId}
            userData={userData}
            getUserData={getUserData}
            updateUserData={updateUserData}
            tavernData={tavernData}
            setTavernData={setTavernData}
            setUserReady={setUserReady}
            setCountdownActive={setCountdownActive}
            userBuzzedIn={userBuzzedIn}
            userAnswered={userAnswered}
            resetTavernMembers={resetTavernMembers}
          />
        )}
      </ContextTavernConsumer>
    )}
  </ContextUserConsumer>
);

export default TavernUpdate;
