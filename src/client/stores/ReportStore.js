import alt from '../alt.js';

import ReportAction from '../actions/ReportAction.js';

class ReportStore {
    constructor() {
        this.bindActions(ReportAction);
        this.clearStore();
    }

    clearStore() {
        this.reportData = [];
        this.isLoading = false;
        this.error = {
            code: 0,
            msg: ''
        };
        this.filters = {
            userID: '',
            year: new Date().getFullYear(),
            reportType: '',
            lineOfWork: 'All',
            customer: 'All',
            role: '',
            empID: ''
        };
        this.source = null;
        this.customers = [{ key: 'All', value: 'All', text: 'All' }];
        this.fetchingCustomerList = false;
        this.lastUpdated = null;
    }

    getReportSuccess(reportData) {
        this.isLoading = false;
        this.lastUpdated = new Date();
        if (reportData.length === 0) {
            this.error = { code: 0, msg: 'No data available for this report.' };
            return;
        }
        if (this.filters.reportType === 'productivity_report') {
            this.reportData = reportData;
            return;
        }
        this.reportData = reportData.sort((a, b) => {
            if (a.role.toLowerCase() > b.role.toLowerCase()) //sort string ascending
                return -1;
            if (a.role.toLowerCase() < b.role.toLowerCase())
                return 1;
            if (a.role === 'Drafter') {
                return a.employeeCode === b.employeeCode ? 0 : a.employeeCode > b.employeeCode;
            }
            try {
                return Number(a.employeeCode) === Number(b.employeeCode) ? 0 : Number(a.employeeCode) - Number(b.employeeCode);
            } catch (e) {
                return a.employeeCode === b.employeeCode ? 0 : a.employeeCode > b.employeeCode;
            }
        });
    }

    setFilters(data) {
        this.filters = { ...this.filters, ...data }
    }

    setLoading(value) {
        this.isLoading = value;
    }

    setError(error) {
        this.setLoading(false);
        this.error = error;
    }

    resetError() {
        this.error = {
            code: 0,
            msg: ''
        };
    }

    getCustomerSuccess(customers) {
        const customerList = [{ key: 'All', value: 'All', text: 'All' }];
        customerList.push(...customers.map(item => item.companyName)
            .filter((customer, pos, arr) => arr.indexOf(customer) == pos)
            .map(customer => {
                return {
                    key: customer,
                    value: customer,
                    text: customer
                };
            })
        );
        this.customers = customerList;
        this.fetchingCustomerList = false;
    }

    setFetchingCustomerList(val) {
        this.fetchingCustomerList = val;
    }

    setLoading(value) {
        this.isLoading = value;
    }

    setDefaultCustomers(arr) {
        this.customers = arr;
        this.filters.customer = 'All'
    }

    setCancelSource(source) {
        this.source = source;
    }

    cancelRequest() {
        if (this.source) {
            this.source.cancel('cancelling_axios_request');
        }
    }
}

export default alt.createStore(ReportStore, 'ReportStore');
