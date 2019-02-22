import alt from '../alt.js';

import AppAction from './AppAction.js';

import Constant from '../components/helpers/Constant.js';
import RequestHandler from '../components/helpers/RequestHandler.js';

class AdminPageAction {
    constructor() {
        this.generateActions(
            'invoicesSortBy',
            'setLoader',
            'updateInvoiceSuccess',
            'updateInvoiceBySocketSuccess',
            'getInvoicesForAdminPageSuccess',
            'getSentPaidInvoicesForAdminPageSuccess',
            'getSentUnPaidInvoicesForAdminPageSuccess',
            'sortInvoices',
            'resetData',
            'setInvoiceLoader',
            'clearStore',
            'addInvoiceBySocketSuccess',
            'addInvoiceSuccess',
            'setUnpaidInvoiceLoader',
            'setPaidInvoiceLoader'
        );
    }

    updateInvoice(invoice, notificationMsg) {
        let self = this;
        let url = 'invoice/' + invoice.id;

        RequestHandler.put(url, invoice).then((updatedInvoice) => {
            self.updateInvoiceSuccess(updatedInvoice);
            AppAction.showNotification({ message: notificationMsg, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            self.resetData();
        });
    }

    getInvoicesForAdminPage(isSent = 'N', isPaid = 'N', limit = null, skip = null) {
        let url = 'invoice/' + isSent + '/' + isPaid + '/' + limit + '/' + skip;
        let self = this;
        RequestHandler.get(url).then((data) => {
            if (isSent === 'Y' && isPaid === 'Y') {
                self.getSentPaidInvoicesForAdminPageSuccess(data);
            } else if (isSent === 'Y' && isPaid === 'N') {
                self.getSentUnPaidInvoicesForAdminPageSuccess(data);
            } else if (isSent === 'N') {
                self.getInvoicesForAdminPageSuccess(data);
            }
        }).catch((err) => {
            self.resetData();
        });
    }

    // Get all sent unpaid invoices for scope-invoices page
    getAllInvoices (isPaid) {
        let url = ['invoice/get-all-invoices/', isPaid].join('');
        RequestHandler.get(url).then((data) => {
            if (isPaid === 'Y') {
                this.getSentPaidInvoicesForAdminPageSuccess(data);
                return;
            }
            this.getSentUnPaidInvoicesForAdminPageSuccess(data);
        }).catch((err) => {
            self.resetData();
        });
    }
}

export default alt.createActions(AdminPageAction);
