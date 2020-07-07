import React, { Fragment, useEffect } from 'react';
// Redux
import { Provider } from 'react-redux'; // redux is separate from react but this combines them together
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { loadUser } from './actions/auth';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Alert from './components/layout/Alert';
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import AddEducation from './components/profile-forms/AddEducation';
import AddExperience from './components/profile-forms/AddExperience';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import PrivateRoute from './components/routing/PrivateRoute';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import Posts from './components/posts/Posts';
import Post from './components/post/Post';

if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {
    useEffect(() => {
        store.dispatch(loadUser(),
            []); // le agrego el segundo parametro para que corra una sola vez, es como decirle que -component did mount- ??
    });

    return (
        <Provider store={store}>
            <Router>
                <Fragment>
                    <Navbar />
                    <Route exact path="/" component={Landing} />
                    <section className="container">
                        <Alert />
                        <Switch>
                            <Route exact path="/register" component={Register} />
                            <Route exact path="/login" component={Login} />
                            <Route exact path="/profiles" component={Profiles} />
                            <Route exact path="/profile/:id" component={Profile} />

                            {/* rutas protegidas PrivateRoute, todas te patean si no estas logueado */}
                            <PrivateRoute exact path="/dashboard" component={Dashboard} />
                            <PrivateRoute exact path="/create-profile" component={CreateProfile} />
                            <PrivateRoute exact path="/edit-profile" component={EditProfile} />
                            <PrivateRoute exact path="/add-experience" component={AddExperience} />
                            <PrivateRoute exact path="/add-education" component={AddEducation} />
                            <PrivateRoute exact path="/posts" component={Posts} />
                            <PrivateRoute exact path="/posts/:id" component={Post} />
                        </Switch>
                    </section>
                </Fragment >
            </Router>
        </Provider>
    )
};
export default App;