import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";

class FriendsListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      score: '',
    };
  }

  componentDidMount(){
    this.props.getUserData(this.props.data).then(result => this.setState({
      name: result.name,
      score: result.score,
    }))
  }

  confirmFriend = userId => {
    this.props.confirmFriendRequest(userId);
  }

  render(){
    return (
      <li className="item-list__item">{this.state.name} {this.state.score ? `(${this.state.score})` : ''} {this.props.confirm ? <button onClick={() => this.confirmFriend(this.props.data)}>Accept</button> : null}</li>
    );
  }
}

const FriendsListItemUpdate = props => (
  <ContextUserConsumer>
    {({ getUserData, confirmFriendRequest }) => (
      <FriendsListItem
        {...props}
        confirmFriendRequest={confirmFriendRequest}
        getUserData={getUserData}
      />
    )}
  </ContextUserConsumer>
);

export default FriendsListItemUpdate;
