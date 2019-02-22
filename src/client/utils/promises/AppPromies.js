import RequestHandler from '../../components/helpers/RequestHandler';

export function updateRole(payload) {
    return RequestHandler.put(`roles/${payload.id}`, payload);
}

export function updateWorkloadGroupStatus(payload) {
    return RequestHandler.put(`roles/groupstatus/${payload.id}`, payload);
}
