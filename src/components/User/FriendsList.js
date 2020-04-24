import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import FriendsListItem from './FriendsListItem';

class FriendsList extends Component {

  confirmFriend = userId => {
    this.props.confirmFriendRequest(userId);
  }

  render(){
    return (
      <React.Fragment>
        {this.props.userData.friends && this.props.userData.friends.length ? (
          <h3>Total Friends: ({this.props.userData.friends && this.props.userData.friends.length})</h3>
        ) : null }

        {this.props.userData.friends && this.props.userData.friends.length ? (
          <ul className="item-list">
            {this.props.userData.friends.sort((a, b) => (a.score > b.score) ? 1 : -1).map(item => {
              return <FriendsListItem key={item} data={item} confirm={false} />
            })}
          </ul>
        ) : null }


        {this.props.userData.friendsPending && this.props.userData.friendsPending.length ? (
          <React.Fragment>
            <p>Pending...</p>
            <ul className="item-list">
              {this.props.userData.friendsPending.sort((a, b) => (a.score > b.score) ? 1 : -1).map(item => {
                return <FriendsListItem key={item} data={item} confirm={true} />
              })}
            </ul>
          </React.Fragment>
        ) : null }
      </React.Fragment>
    );
  }
}

const FriendsListUpdate = props => (
  <ContextUserConsumer>
    {({  userData }) => (
      <FriendsList
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        userData={userData}
      />
    )}
  </ContextUserConsumer>
);

export default FriendsListUpdate;
