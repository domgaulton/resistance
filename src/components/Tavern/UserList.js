import React, { Component } from 'react';
import { ContextTavernConsumer } from "../../context/ContextFirebaseTavernProvider";
import UserListItem from "./UserListItem";

class UserList extends Component {

  userListComponent = (item) => {
    return <UserListItem key={item.id} userData={item} score={item.score} buzzedIn={this.props.tavernData.buzzedIn} />
  }

  render(){
    return (
      <React.Fragment>
        <h3>Ready to go:</h3>
        <ul className="item-list">
          {this.props.tavernData && this.props.tavernData.members && this.props.tavernData.members.length && this.props.tavernData.members.filter(member => member.isReady).map(item => {
            return this.userListComponent(item)
          })}
        </ul>
        <ul className="item-list">
          {this.props.tavernData && this.props.tavernData.members && this.props.tavernData.members.length && this.props.tavernData.members.filter(member => !member.isReady).map(item => {
            return this.userListComponent(item)
          })}
        </ul>
      </React.Fragment>
    );
  }
}

const UserListUpdate = props => (
  <ContextTavernConsumer>
    {({ tavernData }) => (
      <UserList
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        tavernData={tavernData}
      />
    )}
  </ContextTavernConsumer>
);

export default UserListUpdate;
