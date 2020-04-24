import React, { Component } from 'react';
import { firestore, auth } from "../base";
import * as firebase from "firebase/app";
import { ContextMessageConsumer } from './ContextMessageProvider';
import { withRouter } from "react-router";

const Context = React.createContext();
export const ContextUserConsumer = Context.Consumer;

const tavernsCollection = process.env.REACT_APP_FIREBASE_TAVERNS_COLLECTION;
const usersCollection = process.env.REACT_APP_FIREBASE_USERS_COLLECTION;

class FirebaseUserProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userData: {},
      userLoggedIn: false,

      // Auth
      loginUser: (email, password) => this.handleLoginUser(email, password),
      createAuthUser: (email, password, name) => this.handleCreateAuthUser(email, password, name),
      logoutUser: () => this.handleLogoutUser(),
      deleteUser: (userId) => this.handleDeleteUser(userId),

      // Set User Data
      getUserData: (data) => this.handleGetUserData(data),
      setUserData: (data) => this.handleSetUserData(data),
      updateUserData: (userId, fieldName, update) => this.handleUpdateUserData(userId, fieldName, update),

      // Friends
      addNewFriend: (username) => this.handleAddNewFriend(username),
      confirmFriendRequest: (userId) => this.handleConfirmFriendRequest(userId),

      // Settings
      resetPassword: (email) => this.handleResetPassword(email),
    };
  }

  componentDidMount(){
    auth.onAuthStateChanged(user => {
      if (user) {
        this.handleSetUserData(user.uid)

      } else {
        // No user is signed in.
        this.setState({
          userLoggedIn: false,
        })
      }
    });
  }

  componentDidUpdate(prevProps, prevState){
    if (this.state.userData && this.state.userData.friendsPending && this.state.userData.friendsPending !== prevState.userData.friendsPending && this.state.userData.friendsPending.length) {
      this.props.addMessage("New friend request");
    }
  }

  // // // // // //
  // Auth
  // // // // // //

  handleLoginUser = (email, password) => {
    auth.signInWithEmailAndPassword(email, password)
    .then(response => {
      this.handleSetUserData(response.user.uid)
    })
    .catch(error => {
      const errorMessage = error.message;
      this.props.addMessage(errorMessage)
    });
  }

  handleCreateAuthUser = (email, password, name) => {
    auth.createUserWithEmailAndPassword(email, password)
    .then(response => {
      this.setState({
        userId: response.user.uid
      })
      this.handleCreateDatabaseUser(response.user.uid, name)
    })
    .catch(error => {
      const errorMessage = error.message;
      this.props.addMessage(errorMessage);
    });
  }

  handleCreateDatabaseUser = (userId, name) => {
    firestore.collection(usersCollection).doc(userId).set({
      name: name,
      score: 0,
    })
    .then(() => {
      this.handleSetUserData(userId);
    })
    .catch(error => {
      // console.error("Error writing document: ", error);
      this.props.addMessage(error);
    });
  }

  handleLogoutUser = () => {
    auth.signOut()
    .then(() => {
      this.setState({
        userLoggedIn: false,
        userId: '',
      })
    }).catch(error => {
      // An error happened.
      this.props.addMessage(error);
    });
  }

  handleDeleteUser = userId => {
    let newMembers = [];
    const userDoc = firestore.collection(usersCollection).doc(userId);
    userDoc.get()
    .then(response => {
      if (response.exists && response.data().taverns) {
        // Go through each tavern you're a member of and delete trace!
        response.data().taverns.forEach(item => {
          firestore.collection(tavernsCollection).doc(item).get().then(response => {
            const members = response.data().members;
            if (members) {
              newMembers = members.filter(item => item.id !== userId);
              firestore.collection(tavernsCollection).doc(item).update({
                members: newMembers
              })
            }

          })
        })
      }
    })
    .then(() => {
      //Find taverns where user is admin member
      firestore.collection(tavernsCollection).where("admin", "==", userId)
      .get()
      .then(function(query) {
        if (!query.empty) {
          query.forEach(function(response) {
            firestore.collection(tavernsCollection).doc(response.id).delete().then(function() {
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
          });
        }
      })
    })
    .then(() => {
      //Finally delete the user
      userDoc.delete().then(function() {
        const user = auth.currentUser;
        user.delete().then(function() {
          //user deleted
        }).catch(function(error) {
          // An error happened.
          console.log(error);
        });
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
    })
    .then(() => {
      this.setState({
        userLoggedIn: false,
        userId: '',
      })
    })
  }

  // // // // // //
  // Set User Data
  // // // // // //

  handleGetUserData = (userId) => {
    return new Promise((resolve, reject) => {
      const users = firestore.collection(usersCollection).doc(userId);
        users.get()
        .then(response => {
          resolve(response.data());
        })
        .catch(error => {
          reject(error);
        });
    });
  }


  handleSetUserData = userId => {
    this.setState({
      userId: userId
    })
    firestore.collection(usersCollection).doc(userId)
    .onSnapshot({
      includeMetadataChanges: true
    },(response) => {
      const userData = response.data();
      this.setState({
        userData,
        userLoggedIn: true,
      })
    });
  }

  handleUpdateUserData = (userId, fieldName, update) => {
    const user = firestore.collection(usersCollection).doc(userId)
    if (fieldName === 'score') {
      let currentScore = 0;
      user.get()
      .then(response => {
        currentScore = response.data().score;
      })
      .then(() => {
        user.update({
          [fieldName]: currentScore + update,
        })
      })
    } else {
      user.update({
        [fieldName]: update,
      })
    }
  }

  // // // // // //
  // Friends
  // // // // // //
  handleAddNewFriend = username => {
    firestore.collection(usersCollection).where("name", "==", username)
    .get()
    .then(query => {
      if (!query.empty) {
        query.forEach(response => {
          firestore.collection(usersCollection).doc(response.id).update({
            friendsPending: firebase.firestore.FieldValue.arrayUnion(this.state.userId)
          });
        });
      }
      this.props.addMessage("If that user exists they will be sent a message");
      this.props.history.push(`/user/${this.state.userId}`)
    })
  }

  handleConfirmFriendRequest = userId => {
    // Add them to your friendlist
    firestore.collection(usersCollection).doc(this.state.userId).update({
      friends: firebase.firestore.FieldValue.arrayUnion(userId)
    });

    // Remove them from temp list
    firestore.collection(usersCollection).doc(this.state.userId).update({
      friendsPending: firebase.firestore.FieldValue.arrayRemove(userId)
    });

    // Add you to their friend list
    firestore.collection(usersCollection).doc(userId).update({
      friends: firebase.firestore.FieldValue.arrayUnion(this.state.userId)
    });


  }

  // // // // // //
  // Settings
  // // // // // //

  handleResetPassword = email => {
    auth.sendPasswordResetEmail(email).then(() => {
      this.props.addMessage('An email will be sent if the email exists');
    }).catch(error => {
      this.props.addMessage(error);
    });
  }

  render(){
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }

}

// export default FirebaseUserProvider;

const FirebaseUserProviderUpdate = props => (
  <ContextMessageConsumer>
    {({ addMessage }) => (
      <FirebaseUserProvider
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        addMessage={addMessage}
      />
    )}
  </ContextMessageConsumer>
);

export default  withRouter(FirebaseUserProviderUpdate);


