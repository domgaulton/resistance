import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import Login from '../Auth/Login';
import FriendsList from './FriendsList';
import { Link } from 'react-router-dom';
import PageHeader from '../General/PageHeader';

class User extends Component {

  confirmFriend = userId => {
    this.props.confirmFriendRequest(userId);
  }

  render(){
    return this.props.userLoggedIn && this.props.userData ? (

      <div className="container">
      <PageHeader title={`Welcome, ${this.props.userData.name}!`}/>

        <h3>Score</h3>
        <p>{this.props.userData.score}</p>

        <h3>Notifications</h3>
        <p>No new notifications</p>

        <FriendsList />

        <div className="item-block">
          <Link className="item-block__block" to='/add-friend'>Add Friend</Link>
        </div>

      </div>
    ) : (
      <Login />
    );
  }
}

const UserUpdate = props => (
  <ContextUserConsumer>
    {({ userLoggedIn, userData, confirmFriendRequest }) => (
      <User
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        userLoggedIn={userLoggedIn}
        userData={userData}
        confirmFriendRequest={confirmFriendRequest}
      />
    )}
  </ContextUserConsumer>
);

export default UserUpdate;
