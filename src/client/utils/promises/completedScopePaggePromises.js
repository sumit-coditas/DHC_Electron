import RequestHandler from '../../components/helpers/RequestHandler';

export function getCompletedScopes(payload) {
    return RequestHandler.post('scope/users/scopes', payload);
}
