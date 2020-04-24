import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";

class UserListItem extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
    }
  }

  componentDidMount(){
    this.props.getUserData(this.props.userData.id).then(result =>
      this.setState({
        name: result.name,
      })
    )
  }

  render(){
    return (
      <li
        className=
          {`item-list__item item-list__item${this.props.userData.isReady ? '--ready' : '--not-ready'}
          ${this.props.buzzedIn === this.props.userData.id ? 'item-list__item--buzzed-in' : ''}`}
        key={this.props.userData.id}
      >
        <span>{this.state.name}</span>
        <span>({this.props.score})</span>
      </li>
    );
  }
}

const UserListItemUpdate = props => (
  <ContextUserConsumer>
    {({ getUserData }) => (
      <UserListItem
        {...props}
        getUserData={getUserData}
      />
    )}
  </ContextUserConsumer>
);

export default UserListItemUpdate;
