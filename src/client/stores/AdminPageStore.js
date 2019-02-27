import alt from '../alt.js';
import concat from 'lodash/concat';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import remove from 'lodash/remove';
import AdminPageAction from '../actions/AdminPageAction.js';

class AdminPageStore {
    constructor() {
        this.bindActions(AdminPageAction);
        this.clearStore();
    }

    clearStore() {
        this.loader = false;
        this.sortData = {
            Hold: {
                sortBy: 'invoiceNumber',
                ascending: true
            },
            Active: {
                sortBy: 'invoiceNumber',
                ascending: true
            },
            SentPaid: {
                sortBy: 'invoiceNumber',
                ascending: true
            },
            SentUnpaid: {
                sortBy: 'invoiceNumber',
                ascending: true
            }
        };
        this.allInvoices = [];
        this.invoiceLimit = 20;
        this.skipInvoices= 0;
        this.skipPaidInvoices= 0;
        this.skipUnPaidInvoices= 0;
        this.isLoadingInvoices = false;
        this.isLoadingPaidInvoices = false;
        this.isLoadingUnpaidInvoices = false;
        this.stopPagination = false;
        this.stopPaginationForPaidInvoices = false;
        this.stopPaginationForUnPaidInvoices = false;
    }

    resetData() {
        this.loader = false;
        this.isLoadingInvoices = false;
        this.isLoadingPaidInvoices = false;
        this.isLoadingUnpaidInvoices = false;
    }

    _extend(obj, src) {
        if (isArray(src)) {
            obj = cloneDeep(src);
        } else {
            Object.keys(src).forEach(function (key) {
                if (isArray(key)) {
                    obj[key] = cloneDeep(src[key]);
                } else {
                    obj[key] = src[key];
                }
            });
        }
        return obj;
    }

    getInvoicesForAdminPageSuccess(invoices) {
        let self = this;
        if (invoices.length === 0) {
            this.stopPagination = true;
        }
        self.allInvoices = concat(self.allInvoices, invoices);
        self.allInvoices = uniqBy(self.allInvoices, '_id');
        self.skipInvoices = invoices.length + self.skipInvoices;
        self.resetData();
    }

    getSentPaidInvoicesForAdminPageSuccess(invoices) {
        let self = this;
        if (invoices.length === 0) {
            this.stopPaginationForPaidInvoices = true;
        }
        self.allInvoices = concat(self.allInvoices, invoices);
        self.skipPaidInvoices = invoices.length + self.skipPaidInvoices;
        self.resetData();
    }

    getSentUnPaidInvoicesForAdminPageSuccess(invoices) {
        let self = this;
        if (invoices.length === 0) {
            this.stopPaginationForUnPaidInvoices = true;
        }
        self.allInvoices = concat(self.allInvoices, invoices);
        self.skipUnPaidInvoices = invoices.length + self.skipUnPaidInvoices;
        self.resetData();
    }

    invoicesSortBy(payload) {
        let sortBy = this.sortData[payload.groupId];
        this.sortData[payload.groupId] = {
            sortBy: payload.sortBy,
            ascending: !sortBy.ascending
        };
    }

    sortInvoices(payload) {
        let self = this;
        self.sortData[payload.group].sortBy = payload.sortBy;
        self.sortData[payload.group].ascending = !self.sortData[payload.group].ascending;
    }

    setLoader(value) {
        this.loader = value;
    }

    updateInvoiceSuccess(updatedInvoice) {
        const self = this;
        let existingInvoice = find(self.allInvoices, (currentInvoice) => {
            return currentInvoice.id === updatedInvoice.id;
        });
        if (existingInvoice) {
            existingInvoice = self._extend(existingInvoice, updatedInvoice);
            if (!existingInvoice.isVisibleOnAdminPage) {
                remove(self.allInvoices, { id: existingInvoice.id });
            }
        }
        self.resetData();
    }

    updateInvoiceBySocketSuccess(payload) {
        const self = this;
        const updatedInvoice = payload.invoice;
        let existingInvoice = find(self.allInvoices, (currentInvoice) => {
            return currentInvoice.id === updatedInvoice.id;
        });
        if (existingInvoice) {
            existingInvoice = self._extend(existingInvoice, updatedInvoice);
            if (!existingInvoice.isVisibleOnAdminPage || existingInvoice.isArchived) {
                remove(self.allInvoices, { id: existingInvoice.id });
            }
        } else if (!updatedInvoice.selectedScopes[0].scope.task.isBidding && updatedInvoice.isVisibleOnAdminPage) {
            self.allInvoices.push(updatedInvoice);
        }
    }

    addInvoiceSuccess(newInvoice) {
        const self = this;
        self.allInvoices.push(newInvoice);
    }

    addInvoiceBySocketSuccess(payload) {
        const self = this;
        self.allInvoices.push(payload.invoice);
    }

    setInvoiceLoader(bool) {
        this.isLoadingInvoices = bool;
    }

    setPaidInvoiceLoader(bool) {
        this.isLoadingPaidInvoices = bool;
    }

    setUnpaidInvoiceLoader(bool) {
        this.isLoadingUnpaidInvoices = bool;
    }
}

export default alt.createStore(AdminPageStore, 'AdminPageStore');
