import React from 'react';
import { Router, Route } from "react-router-dom";
import FirebaseUserProvider from "../context/ContextFirebaseUserProvider";
import FirebaseTavernProvider from "../context/ContextFirebaseTavernProvider";
import MessageProvider from "../context/ContextMessageProvider";
import Index from "../components/Index";
import Login from '../components/Auth/Login';
import Logout from '../components/Auth/Logout';
import User from "../components/User/Index";
import AddFriend from "../components/User/AddFriend";
import Room from "../components/Tavern/Room";
import TavernHome from "../components/Tavern/Index";
import FindTavern from "../components/Tavern/FindTavern";
import CreateNewTavern from "../components/Tavern/CreateNewTavern";
import TavernSettings from "../components/Tavern/TavernSettings"
import Settings from "../components/Settings/Index";
import Navigation from '../components/Navigation';
import MessageBanner from '../components/General/MessageBanner';
import { createBrowserHistory } from "history";
const history = createBrowserHistory();

function AppRouter() {
  return (
    <Router history={history}>
      <MessageProvider>
        <FirebaseUserProvider>
          <FirebaseTavernProvider>
            <MessageBanner />
            <Route path="/" component={Index} />
            <Route path="/login" exact component={Login} />
            <Route path="/logout" exact component={Logout} />
            <Route path="/user/:userId" component={User} />
            <Route path="/add-friend" exact component={AddFriend} />
            <Route path="/settings" component={Settings} />
            <Route path="/tavern" exact component={TavernHome} />
            <Route path="/find-tavern" exact component={FindTavern} />
            <Route path="/create-tavern" exact component={CreateNewTavern} />
            <Route path="/tavern/:tavernId" exact component={Room} />
            <Route path="/tavern/settings/:tavernId" exact component={TavernSettings} />
            <Navigation />
          </FirebaseTavernProvider>
        </FirebaseUserProvider>
      </MessageProvider>
    </Router>
  );
}

export default AppRouter;
