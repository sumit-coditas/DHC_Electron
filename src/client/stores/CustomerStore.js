import alt from '../alt.js';
import { uniqBy } from 'lodash';
import CustomerAction from '../actions/CustomerAction';

class CustomerStore {
    constructor() {
        this.bindActions(CustomerAction);
        this.clearStore();
    }

    clearStore() {
        this.isLoading = false;
        this.error = {
            code: 0,
            msg: ''
        };
        this.customers = [];
        this.fetchingCustomerList = false;
        this.logo = '';
        this.poster = '';
        this.isUploading = false;
    }

    setError(error) {
        this.setLoading(false);
        this.setIsUploading(false);
        if (error.msg) {
            this.error = error;
        } else {
            this.error = {
                code: 500,
                msg: 'Unable to upload images. Please try after sometime.'
            };
        }
    }

    resetError() {
        this.error = {
            code: 0,
            msg: ''
        };
    }

    getCustomerSuccess(customers) {
        this.allCustomers = customers .map(customer => {
            return {
                key: customer.id,
                value: customer.companyName,
                text: customer.companyName
            };
        });
        this.allCustomers = uniqBy(this.allCustomers, 'value');

        customers = [...customers.map(item => ({
            name: item.companyName.split('[')[0].trim(),
            id: item.id
        }))];
        customers = uniqBy(customers, 'name');
        this.customers = customers .map(customer => {
            return {
                key: customer.id,
                value: customer.name,
                text: customer.name
            };
        });
        this.fetchingCustomerList = false;
    }

    getCustomerImageSuccess(response) {
        if (response === null) {
            this.logo = '';
            this.poster = '';
            return;
        }
        const { logo, poster } = response;
        this.logo = logo || '';
        this.poster = poster || '';
    }

    getCustomerImagesUploadSuccess(data) {
        this.logo = data.logo || '';
        this.poster = data.poster || '';
        this.setIsUploading(false);
    }

    setIsUploading(val) {
        this.isUploading = val;
    }

    setFetchingCustomerList(val) {
        this.fetchingCustomerList = val;
    }

    setLoading(value) {
        this.isLoading = value;
    }

    setPoster(url) {
        this.poster = url;
    }

    setLogo(url) {
        this.logo = url;
    }
}

export default alt.createStore(CustomerStore, 'CustomerStore');
