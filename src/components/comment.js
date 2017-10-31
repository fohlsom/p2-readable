import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'

class Comment extends Component {
  constructor(props) {
    super(props);
    this.setState({component: "Comment"});
  }


  state = {
    displayEditor: 'none',
    bodyInput: this.props.comment.body,
    opacity: 0,
    visibility: "hidden"
  }

  toggleEditor() {
    var value = this.state.displayEditor === 'none' ? "block" : "none";
    this.setState({displayEditor: value});
  }

  updateBody(input) {
    this.setState({bodyInput: input});
  }

  confirmCommentEdits() {

    fetch("http://localhost:3001/comments/" + this.props.comment.id,
    {method: "PUT", body:JSON.stringify({body: this.state.bodyInput.trim()}), headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.EDIT_COMMENT,
          id: this.props.comment.id,
          body: data.body
        }

        this.props.edit_comment(obj);
        this.toggleEditor();
      })
    })
  }


  deleteComment() {
    var ask = window.confirm("Delete This Comment?");
    if(ask === false) {
      return;
    }

    fetch("http://localhost:3001/comments/" + this.props.comment.id,
    {method: "DELETE", headers: api.headers_one()})
    .then((resp) => {

      resp.json().then((data) => {
        var obj = {
          type: actions.DELETE_COMMENT,
          id: data.id,
          deleted: data.deleted,
          parentDeleted: data.parentDeleted
        }

        this.props.delete_comment(obj);
        if(this.props.alertParent){
          this.props.alertParent();
        }
      })
    })
  }

  upvoteComment() {
    fetch("http://localhost:3001/comments/" + this.props.comment.id + "?option=upVote",
    {method: "POST", body:JSON.stringify({option: "upVote"}), headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.UPVOTE_COMMENT,
          id: this.props.comment.id,
          voteScore: data.voteScore
        }

        this.props.upvote_comment(obj);
        this.forceUpdate();
        if(this.props.sortChanged){
          this.props.sortChanged();
        }
      })
    })
  }

  downvoteComment() {
    fetch("http://localhost:3001/comments/" + this.props.comment.id,
    {method: "POST", body:JSON.stringify({option: "downVote"}), headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.DOWNVOTE_COMMENT,
          id: this.props.comment.id,
          voteScore: data.voteScore
        }

        this.props.downvote_comment(obj);
        this.forceUpdate();
        if(this.props.sortChanged){
          this.props.sortChanged();
        }
      })
    })
  }

  render(){
    return (
      <div className="comment">
        <h4>{this.props.comment.body}</h4>
        <p>Vote Score: {this.props.comment.voteScore}</p>
        <br/>
        <p>
          By: <em>{this.props.comment.author}</em><br />
          {"Date"}: {new Date(this.props.comment.timestamp).toString().substr(0,16)}<br/><br />
        </p>
        <div style={{display: this.state.displayEditor}}>
          <label>Post title</label>
          <textarea className="editor editor form-control col-8" value={this.state.bodyInput}
            onChange={(event) => this.updateBody(event.target.value)}></textarea>
          <button className="btn-primary" onClick={() => {this.confirmCommentEdits()}}>OK</button>
          <hr />
        </div>
        <div className="post-buttons-div">
          <button className="btn-primary" onClick={() => {this.upvoteComment()}}>UpVote</button>
          <button className="btn-primary" onClick={() => {this.downvoteComment()}}>DownVote</button>
          <button className="btn-primary" onClick={() => {this.deleteComment()}}>Delete</button>
          <button className="btn-primary" onClick={() => {this.toggleEditor()}}>Edit</button>
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ posts, comments }) {
  return {
    posts,
    comments
  }
}

function mapDispatchToProps (dispatch) {
  return {
    edit_comment: (data) => dispatch(actions.edit_comment(data)),
    delete_comment: (data) => dispatch(actions.delete_comment(data)),
    upvote_comment: (data) => dispatch(actions.upvote_comment(data)),
    downvote_comment: (data) => dispatch(actions.downvote_comment(data))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Comment)
