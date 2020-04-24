import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import { ContextTavernConsumer } from "../../context/ContextFirebaseTavernProvider";
import { Link } from 'react-router-dom';
import Login from '../Auth/Login';
import PageHeader from '../General/PageHeader';

class TavernSettings extends Component {

  render(){
    return this.props.userLoggedIn ? (
      <div className="container">
        <PageHeader title='Admin Settings'/>
        <nav>
          <ul className="item-list">
            <li className="item-list__item">
              <Link  to={`/tavern/${this.props.tavernId}`}>
                <i className="material-icons">exit_to_app</i>
                <span>Back</span>
              </Link>
            </li>
            <li className="item-list__item">
              <span>Admin Participant</span>
              <div className="toggle-switch">
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(event) => this.props.toggleAdminParticipant(event, this.props.tavernId)}
                    checked={this.props.tavernData.adminParticipant}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </li>
            <li className="item-list__item" style={{background: 'red'}} onClick={() => this.props.deleteTavern(this.props.tavernId)}>
              <i className="material-icons">delete_forever</i>
              <span>Delete Room</span>
            </li>
          </ul>
        </nav>
      </div>
    ) : (
      <Login />
    );;
  }
}

const TavernSettingsUpdate = props => (
  <ContextUserConsumer>
    {({ userLoggedIn }) => (
      <ContextTavernConsumer>
        {({ tavernId, tavernData, deleteTavern, toggleAdminParticipant  }) => (
          <TavernSettings
            {...props}
            userLoggedIn={userLoggedIn}
            tavernId={tavernId}
            deleteTavern={deleteTavern}
            tavernData={tavernData}
            toggleAdminParticipant={toggleAdminParticipant}
          />
        )}
      </ContextTavernConsumer>
    )}
  </ContextUserConsumer>
);

export default TavernSettingsUpdate;
