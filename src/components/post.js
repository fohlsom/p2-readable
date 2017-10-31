import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { Link } from 'react-router-dom'

import Comment from '../components/comment'

class Post extends Component {
  constructor(props) {
    super(props);
    this.sortChanged = this.sortChanged.bind(this);
    this.childChanged = this.childChanged.bind(this);
    this.loadComments();
  }

  state = {
    sort: '',
    displayEditor: 'none',
    titleInput: this.props.post.title,
    bodyInput: this.props.post.body,
    opacity: 0,
    visibility: "hidden"
  }

  loadComments() {
    fetch("http://localhost:3001/posts/" + this.props.post.id + "/comments",
    {method: "GET", headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        if(data.length > 0) {
          var obj = {
            type: actions.BUILD_COMMENTS,
            posts: this.props.posts,
            comments: data
          }
          this.props.build_comments(obj);
          this.setState({
            titleInput: this.props.post.title,
            bodyInput: this.props.post.body
          });
        }
      })
    })
  }

  getCommentsLength() {
    var num;
    var array;

    if(Array.isArray(this.props.comments)){
      array = this.props.comments.filter((comment) => {
        return comment.parentId === this.props.post.id && comment.deleted === false;
      });
      num = array.length;
    }
    else {
      var keys = Object.keys(this.props.comments);
      array = keys.filter((comment_id) => {
        return this.props.comments[comment_id].parentId === this.props.post.id && this.props.comments[comment_id].deleted === false;
      });
      num = array.length;
    }

    return num;
  }

  toggleEditor() {
    var value = this.state.displayEditor === 'none' ? "block" : "none";
    this.setState({displayEditor: value});
  }

  updateTitle(input) {
    this.setState({titleInput: input});
  }

  updatedBody(input) {
    this.setState({bodyInput: input});
  }

  confirmPostEdits() {

    fetch("http://localhost:3001/posts/" + this.props.post.id,
    {method: "PUT", body:JSON.stringify({title: this.state.titleInput.trim(), body: this.state.bodyInput.trim()}), headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.EDIT_POST,
          id: this.props.post.id,
          title: data.title,
          body: data.body
        }

        this.props.edit_post(obj);
        this.toggleEditor();
        this.success();
      })
    })
  }

  success() {
    this.setState({opacity: 1, visibility: "visible"}, () => {
      setTimeout(() => {
        this.setState({opacity: 0, visibility: "hidden"});
      } , 2000);
    })
  }

  upvotePost() {
    fetch("http://localhost:3001/posts/" + this.props.post.id,
    {method: "POST", body:JSON.stringify({option: "upVote"}), headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.UPVOTE_POST,
          id: this.props.post.id,
          voteScore: data.voteScore
        }

        this.props.upvote_post(obj);
        this.forceUpdate();
        if(this.props.sortChanged){
          this.props.sortChanged();
        }
      })
    })
  }

  downvotePost() {
    fetch("http://localhost:3001/posts/" + this.props.post.id,
    {method: "POST", body:JSON.stringify({option: "downVote"}), headers: api.headers_one()})
    .then((resp) => {
      resp.json().then((data) => {
        var obj = {
          type: actions.DOWNVOTE_POST,
          id: this.props.post.id,
          voteScore: data.voteScore
        }

        this.props.downvote_post(obj);
        this.forceUpdate();
        if(this.props.sortChanged){
          this.props.sortChanged();
        }
      })
    })
  }

  deletePost() {

    fetch("http://localhost:3001/posts/" + this.props.post.id,
    {method: "DELETE", headers: api.headers_one()})
    .then((resp) => {
      var obj = {
        type: actions.DELETE_POST,
        id: this.props.post.id,
        deleted: true
      }

      this.props.delete_post(obj);
      if(this.props.alertParent){
        this.props.alertParent();
      }
    })
  }

  sortCommentsScoreAsc() {
    if(this.state.sort === 'ASC') {
      return;
    }

    var keys = Object.keys(this.props.comments);
    var comments = keys.map(key => this.props.comments[key]);
    comments.sort((a, b) => {
      if (a.voteScore < b.voteScore) {
        return -1;
      }
      if (a.voteScore > b.voteScore) {
        return 1;
      }
      // a.voteScore must be equal to b.voteScore
      return 0;
    });

    this.setState({sort: 'ASC', sorted_comments: comments})
  }

  sortCommentsScoreDesc() {
    if(this.state.sort === 'DESC') {
      return;
    }

    var keys = Object.keys(this.props.comments);
    var comments = keys.map(key => this.props.comments[key]);
    comments.sort((a, b) => {
      if (a.voteScore > b.voteScore) {
        return -1;
      }
      if (a.voteScore < b.voteScore) {
        return 1;
      }
      // a.voteScore must be equal to b.voteScore
      return 0;
    });

    this.setState({sort: 'DESC', sorted_comments: comments})
  }

  sortChanged() {
    this.setState({sort: "CHANGED"});
  }

  childChanged(){
    this.forceUpdate();
  }

  getRenderKeys() {
    if(this.state.sorted_comments){
      return this.state.sorted_comments.length > 0 ? this.state.sorted_comments.filter(comment => comment.deleted === false && comment.parentId === this.props.post.id) : false;
    }

    if(this.props.comments) {
      var array = [];
      Object.keys(this.props.comments).forEach((item, index) => {
        if( this.props.comments[item].parentId === this.props.post.id && this.props.comments[item].deleted === false ) {
          array.push(this.props.comments[item]);
        }
      });
      return array.length > 0 ? array : false;
    }
    else {
      return false;
    }
  }

  render(){
    var keys = this.getRenderKeys();
    return (
        <div className="post col-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title"><Link to={"/posts/" + this.props.post.id}>{this.props.post.title}</Link></h4>
              <h6 className="card-subtitle mb-2 text-muted">By: <em>{this.props.post.author}</em></h6>
              <p className="card-text">{this.props.post.body}</p>
              <Link className="card-link" to={"/" + this.props.post.category}>Category: {this.props.post.category}</Link>
            </div>
            <div className="card-footer text-muted">
              <p>
                Score: {this.props.post.voteScore} | 
                Comments: {this.props.comments && this.getCommentsLength()} | 
                {" Date"}: {new Date(this.props.post.timestamp).toString().substr(0,16)}
              </p>
              <div className="btn-group" role="group">
                <Link className="btn btn-primary" to={"/posts/" + this.props.post.id + "/create_comment"}>Create Comment</Link> 
                <button className="btn-primary" onClick={() => {this.toggleEditor()}}>Edit</button>
                <button className="btn-primary" onClick={() => {this.deletePost()}}>Delete</button>
                <button className="btn-primary" onClick={() => {this.upvotePost()}}>UpVote</button>
                <button className="btn-primary" onClick={() => {this.downvotePost()}}>DownVote</button>
                {this.props.showComments && keys && keys.length > 0 && (
                  <div className="btn-group" role="group">
                    <button className="btn-primary" onClick={() => {this.sortCommentsScoreAsc()}}>Ascending</button>
                    <button className="btn-primary" onClick={() => {this.sortCommentsScoreDesc()}}>Descending</button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
          <div className="row"><br/></div>
          <div className="form-group" style={{display: this.state.displayEditor}}>
            <label>Post title</label>
            <input className="editor form-control col-8" value={this.state.titleInput}
              onChange={(event) => this.updateTitle(event.target.value)}></input>
            <label>Post body</label>
            <textarea className="editor form-control col-10" value={this.state.bodyInput}
              onChange={(event) => this.updatedBody(event.target.value)}></textarea>
              <button className="btn btn-success" onClick={() => {this.confirmPostEdits()}}>OK</button>
          </div>

            {this.props.showComments && keys && keys.length > 0 }
            {this.props.showComments && keys && keys.length > 0 && keys.map((comment) => (
              <Comment key={comment.id} alertParent={this.childChanged} sortChanged={this.sortChanged} comment={comment} />
            ))}
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
    build_comments: (data) => dispatch(actions.build_comments(data)),
    edit_post: (data) => dispatch(actions.edit_post(data)),
    delete_post: (data) => dispatch(actions.delete_post(data)),
    upvote_post: (data) => dispatch(actions.upvote_post(data)),
    downvote_post: (data) => dispatch(actions.downvote_post(data)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Post)
