import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";

class AddFriend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.addNewFriend(this.state.username);
    this.setState({
      username: '',
    })
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render(){
    return (
      <div className="container">
        <h1>Add a friend</h1>
          <form
            onSubmit={e => this.handleSubmit(e)}
            className="buzzin-form"
          >
          <input
            className="buzzin-form__item buzzin-form__item--text-input"
            type='text'
            placeholder='Friends username'
            name="username"
            value={this.state.username}
            onChange={e => this.handleInputChange(e)}
          />
          <input
            type='submit'
            className="buzzin-form__item buzzin-form__item--submit"
            value="Add Friend"
          />
        </form>
      </div>
    );
  }
}

const AddFriendUpdate = props => (
  <ContextUserConsumer>
    {({ addNewFriend }) => (
      <AddFriend
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        addNewFriend={addNewFriend}
      />
    )}
  </ContextUserConsumer>
);

export default AddFriendUpdate;
