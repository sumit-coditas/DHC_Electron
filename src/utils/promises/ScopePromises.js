import RequestHandler from '../../components/helpers/RequestHandler';

export function updateScopeDataUsingId(scopeId, payload) {
    return RequestHandler.putNew('scope/' + scopeId, payload);
}

export function updateScope(payload) {
    return RequestHandler.put(`scope/${payload.id}`, payload);
}
export function updateBidScopeGroup(taskID) {
    return RequestHandler.put(`tasks/update-bid-scope-task/${taskID}`);
}

export function updateScopeArchive(scopeId, payload) {
    return RequestHandler.put(`scope/archive/${scopeId}`, payload);
}

export function addNewScope(payload) {
    return RequestHandler.postNew('scope', payload);
}

export function addMilestoneToScope(scopeId, milestoneType, payload = {}) {
    return RequestHandler.put(`scope/${scopeId}/${milestoneType}`, payload);
}

export function updateScopeHighlight(scopeId, payload) {
    return RequestHandler.put(`scope/${scopeId}/highlight`, payload);
}

export function addRevScope(payload) {
    return RequestHandler.postNew('scope/add-rev-scope', payload);
}

export function updateScopeSortBy(payload) {
    return RequestHandler.put(`users/${payload.userId}`, payload);
}

export function getReferenceScopes(payload) {
    return RequestHandler.post('scope/get-reference-scopes/', payload);
}

export function getFilterScopes(payload) {
    return RequestHandler.post('scope/filtered', payload)
}

export function getScope(id) {
    return RequestHandler.get('scope/' + id);
}