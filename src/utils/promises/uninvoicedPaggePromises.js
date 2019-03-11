import RequestHandler from '../../components/helpers/RequestHandler';

export function getUninvoicedScopes(payload) {
    return RequestHandler.post('invoice/getHoldInvoices', payload);
}
