import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import { ContextTavernConsumer } from "../../context/ContextFirebaseTavernProvider";

class CreateNewTavern extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      pin: '',
      submitBtnDisabled: true,
    };

    this.form = React.createRef();
  }

  handleCreateTavernSubmit = e => {
    e.preventDefault();
    this.props.createNewTavern(this.state.name, this.state.pin, this.props.userId, this.props.userData.name)
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.name !== prevState.name || this.state.pin !== prevState.pin){
      this.setState({
        submitBtnDisabled: !this.form.current.checkValidity(),
      });
    }
  }

  render(){
    return (
      <div className='container'>
        <h1>Create a new Bunker</h1>
          <form
            ref={this.form}
            onSubmit={e => this.handleCreateTavernSubmit(e)}
            className="buzzin-form"
          >
          <label htmlFor='name'>Bunker Name (no spaces or special characters)</label>
          <input
            className="buzzin-form__item buzzin-form__item--text-input"
            type='text'
            placeholder='Bunker Name'
            name="name"
            pattern="[a-zA-Z0-9]+"
            value={this.state.name}
            onChange={e => this.handleInputChange(e)}
          />
          <label htmlFor='pin'>Pin (4 characters you'll remember to share with other players)</label>
          <input
            className="buzzin-form__item buzzin-form__item--text-input"
            type='text'
            placeholder='Bunker Pin'
            name="pin"
            pattern="[0-9]{4}"
            value={this.state.pin}
            onChange={e => this.handleInputChange(e)}
          />
          <input
            type='submit'
            className="buzzin-form__item buzzin-form__item--submit"
            value="Create Bunker"
            disabled={this.state.submitBtnDisabled}
          />
        </form>
      </div>
    );
  }
}

const CreateNewTavernUpdate = props => (
  <ContextUserConsumer>
    {({ userId, userData, logoutUser }) => (
      <ContextTavernConsumer>
        {({ createNewTavern }) => (
          <CreateNewTavern
            // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
            {...props}
            userId={userId}
            userData={userData}
            logoutUser={logoutUser}
            createNewTavern={createNewTavern}
          />
        )}
      </ContextTavernConsumer>
    )}
  </ContextUserConsumer>
);

export default CreateNewTavernUpdate;
