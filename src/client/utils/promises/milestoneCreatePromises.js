import RequestHandler from '../../components/helpers/RequestHandler';

export function addMilestone(url, payload) {
    return RequestHandler.post(url, payload);
}
