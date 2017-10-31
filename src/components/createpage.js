import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { Link } from 'react-router-dom'
import * as tools from '../tools'
import Header from '../components/header'

class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.getCategories();
  }

  state = {
    displayEditor: 'none',
    title: '',
    body: '',
    owner: 'Mr Poster',
    category: ''
  }

  toggleEditor() {
    var value = this.state.displayEditor === 'none' ? "block" : "none";
    this.setState({displayEditor: value});
  }

  getCategories() {
    fetch("http://localhost:3001/categories/", {method: "GET", headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        // console.log(data, this);
        var obj = {
          type: actions.LOAD_POSTS,
          categories: data.categories
        }
        this.props.load_categories(obj);
      })
    })
  }

  updateTitle(value) {
    this.setState({title: value});
  }

  updateBody(value) {
    this.setState({body: value});
  }

  updateCategory(value) {
    this.setState({category: value});
  }

  processPost() {

    var obj = {
      id: tools.randomValue(),
      timestamp: Date.now(),
      title: this.state.title,
      body: this.state.body,
      author: this.state.owner,
      category: this.state.category
    }

    return JSON.stringify(obj);
  }

  createPost() {
    var body = this.processPost();


    fetch("http://localhost:3001/posts/",
    {method: "POST", body: body, headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        // console.log(data, this);
        var obj = {
          type: actions.ADD_POST,
          id: data.id,
          timestamp: data.timestamp,
          title: data.title,
          body: data.body,
          author: this.state.owner,
          category: data.category,
          deleted: data.deleted,
          voteScore: data.voteScore
        }

        this.props.add_post(obj);
        window.location.href = "/";
      })
    })
  }

  render() {
    return (
        <div className="container">
          <Header/>
          <div className="row">
            <div className="form-group">
              <label>Post title</label>
              <input type="text" className="form-control col-8" value={this.state.title} onChange={(event) => this.updateTitle(event.target.value)}/>
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Post body</label>
              <textarea type="text" className="form-control col-10" value={this.state.body} onChange={(event) => this.updateBody(event.target.value)}></textarea>
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <select value={this.state.category} className="form-control" onChange={(event) => this.updateCategory(event.target.value)}>
                <option disabled>Select category</option>
                {this.props.categories && this.props.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <button className="btn btn-success btn-sm transition" onClick={() => {this.createPost()}}>Submit</button>
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
    add_post: (data) => dispatch(actions.add_post(data)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePage)
