import RequestHandler from '../../components/helpers/RequestHandler';

export function updateSelectedTask(url, payload) {
    return RequestHandler.putNew(url, payload);
}

export function updateTaskManager(taskId, payload) {
    return RequestHandler.putNew('tasks/update/manager/' + taskId, payload);
}

export function updateTask(payload) {
    return RequestHandler.put(`tasks/update/${payload.id}`, payload);
}

export function updateTaskTags(taskId, payload) {
    return RequestHandler.put(`tasks/${taskId}/tags`, payload);
}

export function addNewTag(payload) {
    return RequestHandler.post('tag', payload);
}

export function renameProjectFolder(payload) {
    return RequestHandler.post('ftp_new/rename', payload);
}

export function createProjectFolder(payload) {
    return RequestHandler.post('ftp_new/initial-setup', payload);
}

export function updateMilestone(url, payload) {
    return RequestHandler.putNew(url, payload);
}

export function getMaxTaskNumber(payload) {
    return RequestHandler.put('tasks/maxTaskNumber', payload);
}

export function changeGroup(task) {
    return RequestHandler.put(`tasks/change/group/${task._id}`, task);
}

export function updateBidScopeGroup(taskID) {
    return RequestHandler.put(`tasks/update-bid-scope-task/${taskID}`);
}

export function addComment(taskId, payload) {
    return RequestHandler.post(`tasks/${taskId}/comment`, payload);
}

export function updateComment(taskId, payload) {
    return RequestHandler.put(`tasks/${taskId}/comment`, payload);
}

export function deleteComment(taskId, commentId) {
    return RequestHandler.delete(`tasks/${taskId}/comment/${commentId}`);
}

export function getContractors(query) {
    return RequestHandler.get(`office/contractors/${query}`);
}

export function getContractorContacts(name) {
    return RequestHandler.get(`office/contacts/${name}`);
}

export function syncContractorDetails(payload) {
    return RequestHandler.post('agreement/sync-contractor-details', payload);
}

export function updateTaskNew(taskId, payload) {
    return RequestHandler.put(`tasks/${taskId}`, payload);
}

export function isTaskExist(payload) {
    return RequestHandler.post('tasks/exist', payload);
}

export function addNewTask(payload) {
    return RequestHandler.post('tasks', payload);
}

export function downloadFile(type, payload) {
    return RequestHandler.put(`${type}/${payload.id}`, payload);
}

export function updateHourtracker(payload) {
    return RequestHandler.putNew(`hourTracker_new/${payload.id}`, payload);
}

export function deleteHour(payload) {
    return RequestHandler.delete(`hourTracker_new/${payload.hourId}`);
}

export function addHourRecord(payload) {
    return RequestHandler.post('hourTracker_new', payload);
}

// export function updateScopeWithHourRecord(payload) {
//     return RequestHandler.put(`scope_new/${payload.scopeID}/hourtracker/add`,payload)
// }

export function addHourToScope(scopeId, payload) {
    return RequestHandler.put(`scope/${scopeId}/hourtracker/add`, payload);
}

export function removeHourFromScope(payload) {
    const newPayload = {
        ...payload,
        hourId: payload._id || payload.id
    };
    return RequestHandler.put(`scope/${payload.scopeId}/hourtracker/remove`, newPayload);
}

export function searchTask(payload) {
    return RequestHandler.post('tasks/user/task_scope', payload);
}

export function addMileStone(url, payload) {
    return RequestHandler.post(url, payload);
}

export function addMileStoneToTask(url, payload) {
    return RequestHandler.putNew(url, payload);
}

export function getCitiesStates() {
    return RequestHandler.get('tasks/state-cities');
}