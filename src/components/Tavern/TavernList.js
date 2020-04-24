import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import TavernListItem from "./TavernListItem";

class TavernList extends Component {

  render(){
    return this.props.userData.taverns && this.props.userData.taverns.length > 0 ? (
      <React.Fragment>
        <ul className="item-list">
          {this.props.userData.taverns && this.props.userData.taverns.length && this.props.userData.taverns.map(item => {
            return <TavernListItem key={item} tavernId={item} />
          })}
        </ul>
      </React.Fragment>
    ) : (
      <p>Join or create a tavern below</p>
    );
  }
}

const TavernListUpdate = props => (
  <ContextUserConsumer>
    {({ userData, logoutUser }) => (
      <TavernList
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        userData={userData}
        logoutUser={logoutUser}
      />
    )}
  </ContextUserConsumer>
);

export default TavernListUpdate;
