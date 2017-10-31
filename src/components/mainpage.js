import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { Link } from 'react-router-dom'

import Post from '../components/post'
import Header from '../components/header'


class MainPage extends Component {
  constructor(props) {
    super(props);
    this.sortChanged = this.sortChanged.bind(this);
    this.childChanged = this.childChanged.bind(this);
    this.getCategories();
    this.getPosts();
  }

  state = {
    sort: ''
  }

  getCategories() {
    fetch("http://localhost:3001/categories/", {method: "GET", headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.LOAD_POSTS,
          categories: data.categories
        }
        this.props.load_categories(obj);
      })
    })
  }

  getPosts() {
    fetch("http://localhost:3001/posts/", {method: "GET", headers: api.headers_one()})
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
    posts.sort((x, y) => {
      if (x.voteScore < y.voteScore) {
        return -1;
      }
      if (x.voteScore > y.voteScore) {
        return 1;
      }
      return 0;
    });

    this.setState({sort: 'ASC', sortedPosts: posts})
  }

  sortPostsByScoreDesc() {
    if(this.state.sort === 'DESC') {
      return;
    }

    var keys = Object.keys(this.props.posts);
    var posts = keys.map(key => this.props.posts[key]);
    posts.sort((x, y) => {
      if (x.voteScore > y.voteScore) {
        return -1;
      }
      if (x.voteScore < y.voteScore) {
        return 1;
      }
      return 0;
    });

    this.setState({sort: 'DESC', sortedPosts: posts})
  }

  childChanged(){
    this.forceUpdate()
  }

  sortChanged() {
    this.setState({sort: "CHANGED"});
  }

  getRenderKeys() {
    if(this.state.sortedPosts){
      return this.state.sortedPosts.length > 0 ? this.state.sortedPosts.filter(post => post.deleted === false) : false;
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
          <div className="row">
            <div className="col-2"><button className="btn btn-primary" onClick={() => {this.sortPostsByScoreAsc()}}>Ascending</button></div>
            <div className="col-2"><button className="btn btn-primary" onClick={() => {this.sortPostsByScoreDesc()}}>Descending</button></div>
            <br/><br/>
          </div>
          <div className="row">
            <div className="col">
                {this.props.posts && keys && keys.map((post) => (
                  <Post key={post.id} alertParent={this.childChanged} sortChanged={this.sortChanged} post={post} />
                ))}
            </div>
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
    load_categories: (data) => dispatch(actions.load_categories(data)),
    load_posts: (data) => dispatch(actions.load_posts(data)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPage)
