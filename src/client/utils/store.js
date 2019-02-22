/* eslint-disable no-underscore-dangle */
import thunk from 'redux-thunk';
// import promise from 'redux-promise';
import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from '../reducer/index';


// added for redux developer tool
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function getMiddlewares() {
    let middlewares = [
        thunk,
        promiseMiddleware()
    ];
    return middlewares;
}

const store = createStore(
    reducers,
    composeEnhancers(
        applyMiddleware(...getMiddlewares())
    )
);

export default store;

