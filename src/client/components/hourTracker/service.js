import { updateHourtracker, deleteHour, addHourToScope, removeHourFromScope, addHourRecord } from '../../utils/promises/TaskPromises';
import { getTodaysLoggedHoursOfUser } from '../../utils/promises/UserPromises';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';
import { showFaliureNotification, showSuccessNotification } from '../../utils/notifications';
import { ScopeModel } from '../../model/CustomerHomeModels/ScopeModel';

export function updateHourTrack(payload) {
    updateHourtracker(payload)
        .then((res) => {
            const result = { hourtracker: { ...payload }, scopeId: payload.scopeID }
            ScopeModel.updateHourFromScope(result)
            SelectedTaskDetailModel.updateHourTrackRecord(result, payload.taskId)
            // showSuccessNotification('hour record updated')
            if (payload.hoursSpent && payload.loggedInUserId) {
                getTodaysLoggedHoursOfUser(payload.loggedInUserId);
            }
        })
        .catch(err => {
            console.log('hour record error', err)
            showFaliureNotification('hour record failed')
        })
}

export async function updateHourTrackerScope(payload) {
    try {
        const addHourResponse = await addHourToScope(payload.newScopeId, payload).catch(e => { throw e });
        const removeHourResponse = await removeHourFromScope({ hourtrackerId: payload._id, scopeId: payload.scopeId, _id: payload._id }).catch(e => { throw e });
        ScopeModel.addHourToScope(addHourResponse, payload.taskId);
        SelectedTaskDetailModel.removeHourFromScope({ id: payload.scopeId, hourTracker: payload._id }, payload.taskId);
        ScopeModel.removeHourFromScope({ id: payload.scopeId, hourTracker: payload.hourId });
        // showSuccessNotification('hour record updated')

    } catch (error) {
        console.log('update scope of hour', error)
        showFaliureNotification('hour record failed')
    }
}

export async function deleteHourTrack(payload, taskId) {
    try {
        const response = await deleteHour(payload);
        const removeBody = { ...response, ...payload }
        const removeHourResponse = await removeHourFromScope(payload)
        SelectedTaskDetailModel.removeHourFromScope({ id: payload.scopeId, hourTracker: payload._id }, taskId);
        ScopeModel.removeHourFromScope({ id: payload.scopeId, hourtracker: payload.hourId, hourTracker: payload.hourId })
        // showSuccessNotification('Hour Record Deleted');
        getTodaysLoggedHoursOfUser(payload.loggedInUserId);
    } catch (error) {
        console.log("hour delete from srop", error)
        showFaliureNotification('Hour Record deletion Failed')
    }
}
