import store from './store';

export function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

export function dispatch(action) {
    if (action.type) {
        return store.dispatch(action);
    }
    return store.dispatch(action);
}


export function contains(arr, item) {
   return arr.indexOf(item) > -1;
}