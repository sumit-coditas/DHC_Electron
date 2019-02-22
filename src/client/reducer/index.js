import { combineReducers } from 'redux';

import modelReducer from './modelReducer';
import loadingReducer from './loadingReducer';

const rootReducer = combineReducers({
    models: modelReducer,
    loading: loadingReducer
});

export default rootReducer;
