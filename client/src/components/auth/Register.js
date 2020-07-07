import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
// import axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';

const Register = ({ setAlert, register, isAuthenticated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    }); // useState hook 

    const { name, email, password, password2 } = formData; // (*)

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value }) // ... es para copiar el formData

    const onSubmit = async e => { // marcar como async para axios
        e.preventDefault();
        // puedo acceder a los valores directamente desde cualquier lado porque los descompuse aca (*)
        if (password !== password2) {
            console.log("Passwords do not match");
            setAlert('Passwords do not match', 'danger');
        } else {
            // ESTA ES LA FORMA DE HACERLO SIN REDUX
            // const newUser = {
            //     name,
            //     email,
            //     password
            // };

            // try {
            //     const config = {
            //         headers: {
            //             'Content-Type': 'application/json'
            //         }
            //     }

            //     const body = JSON.stringify(newUser);
            //     const res = await axios.post('api/users', body, config);

            //     console.log(res.data);

            // } catch (err) {
            //     console.error(err.response.data);
            // }
            // FIN FORMA DE HACERLO SIN REDUX

            // con redux
            register({ name, email, password });
        }
    };

    // Redirect if logged in
    if (isAuthenticated) {
        return <Redirect to="/dashboard" />

    }

    return (
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" onSubmit={e => onSubmit(e)}>
                <div className="form-group">
                    <input type="text" placeholder="Name" name="name" value={name} onChange={e => onChange(e)}
                    // required 
                    />
                    {/* usar value va con onChange siempre */}
                </div>
                <div className="form-group">
                    <input type="email" placeholder="Email Address" name="email"
                        value={email} onChange={e => onChange(e)}
                    //  required 
                    />
                    <small className="form-text"
                    >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small
                    >
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        // minLength="6"
                        value={password} onChange={e => onChange(e)}
                    // required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="password2"
                        // minLength="6"
                        value={password2} onChange={e => onChange(e)}
                    // required
                    />
                </div>
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <Link to="/login">Sign In</Link>
            </p>
        </Fragment>
    );
};

Register.propTypes = {
    setAlert: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { setAlert, register })(Register)