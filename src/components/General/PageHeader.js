import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class PageHeader extends Component {
  render(){
    return (
      <div className='page-header'>
        <h1 className='page-header__title'>{this.props.title}</h1>
        {this.props.settings ?
        (
          <Link className='page-header__settings' to={`/tavern/settings/${this.props.settings}`}>
            <i className="material-icons">exit_to_app</i>
          </Link>
        ) : (null)
        }
      </div>
    );
  }
}

export default PageHeader;