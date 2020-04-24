import React, { Component } from 'react';
import { firestore } from "../base";
import * as firebase from "firebase/app";
import { ContextMessageConsumer } from './ContextMessageProvider';
import { withRouter } from "react-router";

const Context = React.createContext();
export const ContextTavernConsumer = Context.Consumer;

const tavernsCollection = process.env.REACT_APP_FIREBASE_BUNKER_COLLECTION;
const usersCollection = process.env.REACT_APP_FIREBASE_USERS_COLLECTION;

class FirebaseTavernProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tavernId: '',
      tavernData: {},

      // Tavern Data
      setTavernData: (data) => this.handleSetTavernData(data),
      getTavernData: (data) => this.handleGetTavernData(data),

      // Update / New Taverns
      createNewTavern: (name, pin, userId, memberName) => this.handleCreateNewTavern(name, pin, userId, memberName),
      addToExistingTavern: (tavernName, pin, userId, memberName) => this.handleAddToExistingTavern(tavernName, pin, userId, memberName),

      // Tavern Room Functionality
      setUserReady: (userId, bool) => this.handleSetUserReady(userId, bool),
      setCountdownActive: (data) => this.handleSetCountdownActive(data),
      resetUsersToNotReady: (tavernId) => this.handleResetUsersToNotReady(tavernId),
      userBuzzedIn: (userId) => this.handleUserBuzzedIn(userId),
      userAnswered: (correct, userId, score) => this.handleUserAnswered(correct, userId, score),
      resetTavernMembers:  () => this.handleResetTavernMembers(),

      // Settings
      toggleAdminParticipant: (event, tavernId) => this.handleToggleAdminParticipant(event, tavernId),
      deleteTavern: (tavernId) => this.handleDeleteTavern(tavernId),
    };
  }

  // // // // // //
  // Tavern Data
  // // // // // //

  handleSetTavernData = tavernId => {
    this.setState({
      tavernId,
    })
    firestore.collection(tavernsCollection).doc(tavernId)
    .onSnapshot({
      includeMetadataChanges: true
    },(response) => {
      const tavernData = response.data();
      this.setState({
        tavernData,
      })
    });
  }

  handleGetTavernData = (tavernId) => {
    return new Promise((resolve, reject) => {
      const tavern = firestore.collection(tavernsCollection).doc(tavernId);
        tavern.get()
        .then(response => {
          resolve(response.data());
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // // // // // //
  // Update / New Taverns
  // // // // // //

  handleCreateNewTavern = (name, pin, userId, memberName) => {
    // Check if tavern exists first
    firestore.collection(tavernsCollection).where("name", "==", name)
    .get()
    .then(query => {
      if (query.empty) {
        firestore.collection(tavernsCollection).add({
          name: name,
          pin: pin,
          countdown: 30,
          countdownActive: false,
          round: 0,
          rounds: [],
          admin: userId,
          buzzedIn: '',
        })
        .then(response => {
          // Add this as an array item on tavernAdmin list
          this.updateUserTaverns('add', userId, response.id);
          this.updateTavernMembers('add', response.id, userId);
        })
        .catch(error => {
          this.props.addMessage(error);
        });
        this.props.addMessage("Bunker added");
        this.props.history.push("/tavern")
      } else {
        this.props.addMessage("Bunker name already exists, please pick another");
      }
    })
  }

  handleAddToExistingTavern = (tavernName, pin, userId, memberName) => {
    firestore.collection(tavernsCollection).where("name", "==", tavernName)
    .get()
    .then(query => {
      // if tavern exists
      if (!query.empty) {
        query.forEach(response => {
          // if user exists in tavern listing already do nothing
          const userExists = response.data().members.some(member => member.id === userId)
          if (!userExists) {
            this.updateUserTaverns('add', userId, response.id);
            this.updateTavernMembers('add', response.id, userId);
            this.props.addMessage("You've been added!");
            this.props.history.push("/tavern")
          } else {
            this.props.addMessage("You're already in this bunker!");
            return
          }
        });
      }
    })
    .catch(error => {
      this.props.addMessage(error);
    });
  }

  // // // // // //
  // Tavern Room Functionality
  // // // // // //

  handleSetUserReady = (userId, bool) => {
    this.updateTavernMembersIndividually(userId, 'isReady', bool);
  }

  handleSetCountdownActive = bool => {
    firestore.collection(tavernsCollection).doc(this.state.tavernId).update({
      countdownActive: bool,
      buzzedIn: '',
    })
    .catch(error => {
      this.props.addMessage(error);
    });
  }

  handleResetUsersToNotReady = tavernId => {
    const tavernDoc = firestore.collection(tavernsCollection).doc(tavernId);
    tavernDoc.get().then(response => {
      if (!response.empty && response.data().members) {
        response.data().members.forEach(item => {
          this.updateTavernMembersIndividually(item.id, 'isReady', false);
        })
      }
    });
  }

  handleUserBuzzedIn = userId => {
    const tavernDoc = firestore.collection(tavernsCollection).doc(this.state.tavernId);
    tavernDoc.update({
      buzzedIn: userId,
    });
  }

  handleUserAnswered = (correct, userId, score) => {
    const tavernDoc = firestore.collection(tavernsCollection).doc(this.state.tavernId);
    tavernDoc.update({
      buzzedIn: '',
    });
    if (correct === 'true'){
      tavernDoc.update({
        countdownActive: false,
      });
      this.updateTavernMembersIndividually(userId, 'score', 5);
      this.handleResetUsersToNotReady(this.state.tavernId);
    }
  }

  // // // // // //
  // Settings
  // // // // // //

  handleToggleAdminParticipant = (event, tavernId) => {
    const checked = event.currentTarget.checked;
    let newMembers = []
    const tavernDoc = firestore.collection(tavernsCollection).doc(tavernId);
    tavernDoc.update({
      adminParticipant: checked,
    })

    // remove / add admin user to members list
    tavernDoc.get().then(response => {
      const members = response.data().members;
      const admin = response.data().admin;
      if (members && admin && checked) {
        this.updateTavernMembers('add', tavernId, admin);
      } else if (members && admin && !checked) {
        newMembers = members.filter(item => item.id !== admin);
        tavernDoc.update({
          members: newMembers
        })
      }
    })
    .catch(error => {
      // this.props.addMessage(error);
      console.log(error)
    });
  }

  handleDeleteTavern = tavernId => {
    const tavernDoc = firestore.collection(tavernsCollection).doc(tavernId);
    // store members to delete later
    tavernDoc.get().then(response => {
      if (!response.empty && response.data().members) {
        response.data().members.forEach(item => {
          this.updateUserTaverns('remove', item.id, tavernId);
        })
      }

      tavernDoc.delete().then(() => {
        this.props.addMessage('Bunker Deleted');
        this.props.history.push("/tavern")
      }).catch(error => {
        this.props.addMessage(error);
      });
    });
  }

  // // // // // //
  // Global Functions
  // // // // // //

  updateTavernMembers = (task, tavernId, userId)  => {
    // only do something current if we are adding a user
    if (task === 'add') {
      firestore.collection(tavernsCollection).doc(tavernId).update({
        members: firebase.firestore.FieldValue.arrayUnion({
          isReady: false,
          id: userId,
          score: 0,
        })
      });
    } else {
      return;
    }
  }

  updateTavernMembersIndividually = (userId, fieldName, update) => {
    let newMembers = []
    firestore.collection(tavernsCollection).doc(this.state.tavernId)
    .get()
    .then(response => {
      let members = response.data().members;
      // create a temp array to set whole member data later
      newMembers = members
      newMembers.map(member => {
        if (member.id === userId) {
          if (fieldName === 'score' && update !== 0) {
            member[fieldName] = member[fieldName] + update;
          } else {
            member[fieldName] = update
          }
          return member[fieldName];
        } else {
          return member;
        }
      });
    })
    .then(() => {
      // set the member data from temp above!
      firestore.collection(tavernsCollection).doc(this.state.tavernId).update({
        members: newMembers
      });
    })
  }

  handleResetTavernMembers = () => {
    let newMembers = []
    firestore.collection(tavernsCollection).doc(this.state.tavernId)
    .get()
    .then(response => {
      const members = response.data().members;
      // create a temp array to set whole member data later
      newMembers = members.map(member => {
        member = {
          ...member,
          isReady: false,
          score: 0,
        }
        return member;
      });
    })
    .then(() => {
      // set the member data from temp above!
      firestore.collection(tavernsCollection).doc(this.state.tavernId).update({
        members: newMembers
      });
    })
  }

  updateUserTaverns = (task, userId, tavernId) => {
    if (task === 'add') {
      firestore.collection(usersCollection).doc(userId).update({
        taverns: firebase.firestore.FieldValue.arrayUnion(tavernId)
      });
    } else if (task === 'remove') {
      firestore.collection(usersCollection).doc(userId).update({
        taverns: firebase.firestore.FieldValue.arrayRemove(tavernId)
      });
    }
  }

  render(){
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

const FirebaseTavernProviderUpdate = props => (
  <ContextMessageConsumer>
    {({ addMessage }) => (
      <FirebaseTavernProvider
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        addMessage={addMessage}
      />
    )}
  </ContextMessageConsumer>
);

export default withRouter(FirebaseTavernProviderUpdate);
