import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { fetchUsers } from '../redux/users';
import { fetchUser } from '../redux/user';
import { fetchBooks } from '../redux/books';

import Nav from './Nav';
import Verify from './Verify';
import Welcome from './Welcome';
import Hotel from './Hotel';

class Root extends React.Component {

  componentDidMount() {
    this.props.fetchUsers();
    this.props.fetchBooks();
    this.props.fetchUser();
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Nav />
            <Route exact path='/' component={Hotel} />
            <Route exact path='/verify' render={({ history }) => <Verify history={history} />} />
            <Route exact path='/welcome' render={({ history }) => <Welcome history={history} />} />
          </div>
        </Router>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUsers: () => dispatch(fetchUsers()),
    fetchUser: () => dispatch(fetchUser()),
    fetchBooks: () => dispatch(fetchBooks())
  }
}

export default connect(null, mapDispatchToProps)(Root);


