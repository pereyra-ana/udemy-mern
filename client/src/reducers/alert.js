// reducer: function that takes in a piece of state an executes an action

import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [{
    // esto va a ser - action.payload
    // id: 1,
    // msg: 'Please log in',
    // alertType: 'error'
}];

export default function (state = initialState, action) {
    const { type, payload } = action; // descompongo

    switch (type) {
        case SET_ALERT:
            return [...state, payload]; // ... spread operator

        case REMOVE_ALERT:
            return state.filter(alert => alert.id !== payload);
        default:
            return state;
    }
}
