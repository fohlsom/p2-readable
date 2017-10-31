import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Header extends Component {

  

  render() {

    return (
      <div className='Header'>
          <div className="row top-nav">
            <div className="col-6"><h2><Link to="/">Project 2 - Readable app</Link></h2></div>
            <div className="col-2"><button className="btn btn-primary"><Link to="/create/post">Create Post</Link></button></div>
          </div>
          <div className="row">
            <div className="col">
              <hr/>
            </div>
          </div>
      </div>
    )
  }
}

export default Header;
