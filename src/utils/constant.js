
export const LOADING = 'LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_LOADING = 'SET_LOADING';
export const SET_SUCCESS = 'SET_SUCCESS';
export const RELOAD = 'RELOAD';
export const UNSET_RELOAD = 'UNSET_RELOAD';
export const ERROR_STATE = { isLoading: false, hasError: true };
export const PENDING_STATE = { isLoading: true, hasError: false };
export const SUCCESS_STATE = { isLoading: false, hasError: false };
export const SET_LOADING_STATE = 'SET_LOADING_STATE';
export const DELETE_ALL_INSTANCES = 'DELETE_ALL_INSTANCES';
export const DELETE_INSTANCE = 'DELETE_INSTANCE';
export const SAVE_ALL_INSTANCES = 'SAVE_ALL_INSTANCES';
export const SAVE_INSTANCE = 'SAVE_INSTANCE';
export const SAVE_LAST = 'SAVE_LAST';
export const INVALID_INSTANCE_CANNOT_SAVE = 'INVALID_INSTANCE_CANNOT_SAVE';
export const SAVE_ALL_INSTANCES_ON_TOP = 'SAVE_ALL_INSTANCES_ON_TOP'
export const PLPDATE_FORMAT = 'M-D-YY'