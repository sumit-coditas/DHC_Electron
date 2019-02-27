import RequestHandler from '../../components/helpers/RequestHandler';

export function getCustomerScopesAndContacts(userId) {
    return RequestHandler.post('tasks/getScopesAndContactsOfCustomerNew', { userId });
}

export function fetchCompanyDetails(payload) {
    return RequestHandler.post('tasks/getScopesAndContactsOfCustomer', payload);
}

export function getAccessToken() {
    return RequestHandler.get('office/access-token-for-customer');
}

export function getAllCustomers() {
    return RequestHandler.post('users/get-all-customer');
}

export function getTaskDetails(taskId) {
    let url = 'tasks/' + taskId;
    return RequestHandler.get(url);
}
