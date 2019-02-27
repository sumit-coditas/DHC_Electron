import RequestHandler from '../../components/helpers/RequestHandler';

export function updateKeyword(payload) {
    return RequestHandler.put(`keyword/update-custom-keyword/${payload.keyword.id}`, payload);
}

export function addKeyword(payload) {
    return RequestHandler.post('keyword', payload);
}

export function updateItemKeyword(payload) {
    return RequestHandler.put('keyword/'+payload.id, payload);
}

export function addItemType(payload) {
    return RequestHandler.post('itemTypes', payload);
}

export function updateItemType(payload) {
    return RequestHandler.put('itemTypes/'+payload.id, payload);
}

export function getAllItemTypes() {
    return RequestHandler.get('itemTypes');
}

export function searchKeywords(payload) {
    return RequestHandler.post('keyword/search',payload);
}