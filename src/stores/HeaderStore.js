import union from 'lodash/union';

import alt from '../alt.js';

import HeaderAction from '../actions/HeaderAction.js';

class HeaderStore {
    constructor() {
        this.bindActions(HeaderAction);
        this.clearStore();
    }

    clearStore() {
        this.searchOptions = [];
        this.isLoading = false;
        this.searchValue = '';
        this.activeLink = '';
    }

    searchOptionsSuccess(options) {
        this.searchOptions = [];
        this.searchOptions = union(options.users, options.tasks);
        this.isLoading = false;
    }

    setLoaderAndValue(value) {
        this.isLoading = true;
        this.searchValue = value;
    }

    resetData() {
        this.searchOptions = [];
        this.isLoading = false;
        this.searchValue = '';
    }

    setActiveNavLink(link) {
        this.activeLink = link;
    }
}

export default alt.createStore(HeaderStore, 'HeaderStore');
