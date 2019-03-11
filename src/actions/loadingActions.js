import { dispatch } from '../utils/utils';

export function executePromiseAction(promise, identifier) {
    return dispatch({
        type: `${identifier}/LOADING`,
        payload: {
            promise
        },
        meta: {
            identifier
        }
    });
}

export function setLoading(identifier) {
    return dispatch({
        type: `${identifier}/SET_LOADING`,
        meta: { identifier }
    });
}

export function setError(identifier) {
    return dispatch({
        type: `${identifier}/SET_ERROR`,
        meta: { identifier }
    });
}

export function setSuccess(identifier) {
    return dispatch({
        type: `${identifier}/SET_SUCCESS`,
        meta: { identifier }
    });
}