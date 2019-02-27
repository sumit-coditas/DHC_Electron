import { dispatch } from '../utils/utils';
import { DELETE_ALL_INSTANCES, DELETE_INSTANCE, SAVE_ALL_INSTANCES, SAVE_INSTANCE, SAVE_LAST, SAVE_ALL_INSTANCES_ON_TOP } from '../utils/constant';


/** Generates an action creator which dispatches instance related actions.  */
function generateModelAction(type) {
    return (instance, key, identifier = '') => {
        return dispatch({
            type: identifier ? `${type}/${identifier}` : type,
            instance,
            key
        });
    };
}

/** Used to propagate the instance changes to the store. */
export const saveInstance = generateModelAction(SAVE_INSTANCE);

/** Used to remove an instance from the store. */
export const deleteInstance = generateModelAction(DELETE_INSTANCE);

/** Used to save multiple instances to the store. */
export function saveAllInstances(instanceMap) {
    return dispatch({
        type: SAVE_ALL_INSTANCES,
        instanceMap
    });
}

    /** Used delete multiple instances from the store. */
    export function deleteAllInstances(instanceKeys) {
        return dispatch({
            type: DELETE_ALL_INSTANCES,
            instances: instanceKeys
        });
    }

    /** Used to save the last instance on a listing page. */
    export function saveLast(instance) {
        return dispatch({
            type: SAVE_LAST,
            id: instance.props.id,
            resource: instance.resource
        });
    }

    /** Used to save multiple instances to the store on Top. */
export function saveAllInstancesOnTop(instanceMap) {
    return dispatch({
        type: SAVE_ALL_INSTANCES_ON_TOP,
        instanceMap
    });
}