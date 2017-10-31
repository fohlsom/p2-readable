import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { Link } from 'react-router-dom'
import Header from '../components/header'

import Post from '../components/post'

class PostsByCategory extends Component {
  constructor(props) {
    super(props);
    this.sortChanged = this.sortChanged.bind(this);
    this.childChanged = this.childChanged.bind(this);
    this.getPosts();
  }

  state = {

  }

  getPosts() {
    fetch("http://localhost:3001/" + this.props.match.params.category + "/posts", {method: "GET", headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.LOAD_POSTS,
          posts: data
        }
        this.props.load_posts(obj);
      })
    })
  }

  sortPostsByScoreAsc() {
    if(this.state.sort === 'ASC') {
      return;
    }

    var keys = Object.keys(this.props.posts);
    var posts = keys.map(key => this.props.posts[key]);
    posts.sort((a, b) => {
      if (a.voteScore < b.voteScore) {
        return -1;
      }
      if (a.voteScore > b.voteScore) {
        return 1;
      }
      // a.voteScore must be equal to b.voteScore
      return 0;
    });

    this.setState({sort: 'ASC', sorted_posts: posts})
  }

  sortPostsByScoreDesc() {
    if(this.state.sort === 'DESC') {
      return;
    }

    var keys = Object.keys(this.props.posts);
    var posts = keys.map(key => this.props.posts[key]);

    posts.sort((a, b) => {
      if (a.voteScore > b.voteScore) {
        return -1;
      }
      if (a.voteScore < b.voteScore) {
        return 1;
      }
      // a.voteScore must be equal to b.voteScore
      return 0;
    });

    this.setState({sort: 'DESC', sorted_posts: posts})
  }

  sortChanged() {
    this.setState({sort: "CHANGED"});
  }

  childChanged(){
    this.forceUpdate()
  }

  getRenderKeys() {
    if(this.state.sorted_posts){
      return this.state.sorted_posts.length > 0 ? this.state.sorted_posts.filter(post => post.deleted === false) : false;
    }

    if(this.props.posts) {
      var array = [];
      Object.keys(this.props.posts).forEach((key, index) => {
        if(this.props.posts[key].deleted === false) {
          array.push(this.props.posts[key]);
        }
      });
      return array.length > 0 ? array : false;
    }
    else {
      return false;
    }
  }

  render() {
    var keys = this.getRenderKeys();
    return (
        <div className="container">
          <Header/>
          <div className="posts">
            {this.props.posts && keys && keys.map((post) => (
              <div className="row">
                <Post key={post.id} alertParent={this.childChanged} sortChanged={this.sortChanged} post={post} />
              </div>
            ))}
          </div>
        </div>
    );
  }
}

function mapStateToProps ({ posts, comments, categories }) {
  return {
    posts,
    comments,
    categories
  }
}

function mapDispatchToProps (dispatch) {
  return {
    load_posts: (data) => dispatch(actions.load_posts(data)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostsByCategory)
