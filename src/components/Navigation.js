import React, { Component } from 'react';
import { ContextUserConsumer } from "../context/ContextFirebaseUserProvider";
import { Link } from 'react-router-dom';

class Navigation extends Component {

  render(){
    return this.props.userLoggedIn && (
      <nav className="bz-navigation">
        <ul className="bz-navigation__wrapper">
          <li>
            <Link className="bz-navigation__item" to={`/user/${this.props.userId}`}>
              <i className="material-icons">person</i>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link className="bz-navigation__item" to={`/tavern/`}>
              <i className="material-icons">videogame_asset</i>
              <span>Bunkers</span>
            </Link>
          </li>
          <li>
            <Link className="bz-navigation__item" to={`/settings/${this.props.userId}`}>
              <i className="material-icons">new_releases</i>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

const NavigationUpdate = props => (
  <ContextUserConsumer>
    {({ userId, userLoggedIn}) => (
      <Navigation
        {...props}
        userId={userId}
        userLoggedIn={userLoggedIn}
      />
    )}
  </ContextUserConsumer>
);

export default NavigationUpdate;
