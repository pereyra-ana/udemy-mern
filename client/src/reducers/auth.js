import {
    AUTH_ERROR,



    LOGIN_FAIL, LOGIN_SUCCESS,



    LOGOUT, REGISTER_FAIL, REGISTER_SUCCESS,

    USER_LOADED
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'), // obtengo el token del local storage
    isAuthenticated: null, // por default es un no
    loading: true, // por default es true
    user: null
};

export default function (state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: payload
            };
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem('token', payload.token);
            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false
            };
        case REGISTER_FAIL:
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false
            };
        default:
            return state;
    }

};
