import React, { Component } from 'react';
import * as actions from '../actions'
import { connect } from 'react-redux'
import * as api from '../api'
import { Link } from 'react-router-dom'
import Header from '../components/header'


class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.getCategories();
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

  render() {
    var keys = this.props.categories ? this.props.categories : false;
    return (
      <div className="container">
        <Header/>
        <div className="row">
          <h3>Categories:</h3>
          <ul>
            {this.props.categories && keys && this.props.categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

function mapStateToProps ({ categories }) {
  return {
    categories
  }
}

function mapDispatchToProps (dispatch) {
  return {
    load_categories: (data) => dispatch(actions.load_categories(data))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePage)
