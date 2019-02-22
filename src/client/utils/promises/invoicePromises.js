import RequestHandler from '../../components/helpers/RequestHandler';

export function updateInvoice(payload) {
    return RequestHandler.put(`invoice/${payload.invoice.id}`, payload);
}

export function getSentPaidInvoices(from, to) {
    // return RequestHandler.get(`invoice/Y/Y/${to}/${from}`);
    return RequestHandler.get(`invoice/?sent=Y&paid=Y&limit=${to}&skip=${from}`);
}
export function getSentUnpaidInvoices(from, to) {
    // return RequestHandler.get(`invoice/Y/N/${to}/${from}`);
    return RequestHandler.get(`invoice/?sent=Y&paid=N&limit=${to}&skip=${from}`);
}
export function getAllSentUnpaid() {
    return RequestHandler.get('invoice/get-all-invoices/N');
}

export function getActiveHoldInvoices() {
    return RequestHandler.get('invoice/?sent=N&paid=N');
}

export function getUninvoicedScopes(payload) {
    return RequestHandler.get(`invoice/unInvoiced/${payload.userID}`);
}
