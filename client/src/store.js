// boiler plate ???
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};
const middleware = [thunk];
const store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

export default store;

// un store es como una 'nube' donde vive el estado (state) de cada objeto, que esta a nivel global,
//  para poder acceder y pasarle el valor a los componentes