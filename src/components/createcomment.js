import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { Link } from 'react-router-dom'
import * as tools from '../tools'
import Header from '../components/header'

class CreateComment extends Component {
  constructor(props) {
    super(props);
    this.setState({component: "Create Comment"});
  }

  state = {
    body: '',
    owner: 'Mr Comment'
  }

  updateFormBody(value) {
    this.setState({body: value});
    //console.log(this);
  }

  validateNewCommentInputs() {
    if(this.state.body.length < 5) {
      return null;
    }

    var obj = {
      id: tools.randomValue(),
      timestamp: Date.now(),
      body: this.state.body.trim(),
      author: this.state.owner,
      parentId: this.props.match.params.id
    }
    console.log(obj);

    return JSON.stringify(obj);
  }

  createComment() {
    var body = this.validateNewCommentInputs();
    if(body === null) {
      alert("Check All Input Fields.\nBody Must Be a Minimum of 5 Characters.");
      return;
    }

    fetch("http://localhost:3001/comments",
    {method: "POST", body: body, headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        // console.log(data, this);
        var obj = {
          type: actions.ADD_COMMENT,
          id: data.id,
          timestamp: data.timestamp,
          body: data.body,
          author: this.state.owner,
          parentId: data.parentId,
          deleted: data.deleted,
          voteScore: data.voteScore,
          parentDeleted: data.parentDeleted
        }

        this.props.add_comment(obj);
        window.location.href = "/posts/" + this.props.match.params.id;
      })
    })
  }

  render() {
    return (
      <div className="container">
        <Header/>
        <div className="row">
          <div className="col-2"><button className="btn btn-primary"><Link to={"/posts/" + this.props.match.params.id}>Back to post</Link></button></div>
          <label>Comment</label>
            <textarea className="form-control col-10" value={this.state.body} onChange={(event) => this.updateFormBody(event.target.value)}></textarea>
        </div>
        <div className="row">
          <button className="btn btn-success btn-sm transition" onClick={() => {this.createComment()}}>Submit</button>
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
    add_comment: (data) => dispatch(actions.add_comment(data)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateComment)
