import alt from '../alt.js';
import axios from 'axios'

import RequestHandler from '../components/helpers/RequestHandler.js';


class ReportAction {
    constructor() {
        this.generateActions('getReportSuccess', 'setFilters',
            'getCustomerSuccess', 'setLoading', 'setFetchingCustomerList',
            'setDefaultCustomers', 'setError', 'resetError', 'setCancelSource', 'cancelRequest');
    }

    getReport(filters) {
        if (filters.reportType === '') {
            return;
        }
        this.resetError();
        this.setLoading(true);
        const url = 'reports/get-report-data';
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        let payload = { ...filters };
        if (filters.reportType.match(/^(productivity_report|total_and_pto_report|dollar_per_total_and_pto_report|pto_report|total_hours_report)$/)) {
            delete payload.lineOfWork;
            delete payload.customer;
        } else {
            if (payload.lineOfWork === 'All') {
                delete payload.lineOfWork;
            }

            if (payload.customer === 'All') {
                delete payload.customer;
            }
        }

        RequestHandler.postNew(url, payload, { cancelToken: source.token })
            .then(response => this.getReportSuccess(response.data))
            .catch(error => {
                if (!axios.isCancel(error)) {
                    this.setError(error.response.data);
                }
            });

        this.setCancelSource(source);
    }

    getCustomers(query) {
        const url = `office/contractors/${query}`;
        this.setFetchingCustomerList(true);
        RequestHandler.get(url)
            .then(customers => this.getCustomerSuccess(customers))
            .catch(error => {
                console.log(error);
                this.setError(error);
            });
    }

    setFilter(data) {
        this.setFilters(data);
    }

    setDefaultCustomerList() {
        const customer = [{ key: 'All', value: 'All', text: 'All' }];
        this.setDefaultCustomers(customer);
    }

    cancelReportRequest() {
        this.cancelRequest();
    }

}

export default alt.createActions(ReportAction);
