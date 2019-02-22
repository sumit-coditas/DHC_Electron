import alt from '../alt.js';
import CustomerPageAction from '../actions/CustomerPageAction.js';

class CustomerPageStore {
    constructor () {
        this.bindActions(CustomerPageAction);
        this.resetStore();
    }

    resetStore () {
        this.loading = false;
        this.customerPageData = [];
    }


    setLoading (state) {
        this.loading = state;
    }

    getCustomerTaskSuccess (data) {
        // let TableData = this.prepareDataForTable(data);
        this.customerPageData = data;
        this.setLoading(false);
    }
}

export default alt.createStore(CustomerPageStore, 'CustomerPageStore');
