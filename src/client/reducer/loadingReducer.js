import { fromJS } from 'immutable';

export default function loadingReducer(state = fromJS({}), { type, meta, payload }) {
    let typeTokens = type.split('/');

    const SUCCESS_STATE = { isLoading: false, hasError: false };
    const ERROR_STATE = { isLoading: false, hasError: true };
    const PENDING_STATE = { isLoading: true, hasError: false };

    switch (typeTokens[1]) {
    case 'LOADING':
        return state.set(meta.identifier, SUCCESS_STATE);
    case 'LOADING_PENDING':
        return state.set(meta.identifier, PENDING_STATE);
    case 'LOADING_FULFILLED':
        return state.set(meta.identifier, SUCCESS_STATE);
    case 'LOADING_REJECTED':
        return state.set(meta.identifier, ERROR_STATE);
    case 'SET_LOADING_STATE':
        return state.set(meta.identifier, payload);
    case 'SET_LOADING':
        return state.set(meta.identifier, PENDING_STATE);
    case 'SET_ERROR':
        return state.set(meta.identifier, ERROR_STATE);
    case 'SET_SUCCESS':
        return state.set(meta.identifier, SUCCESS_STATE);
    default:
        return state;
    }
}

