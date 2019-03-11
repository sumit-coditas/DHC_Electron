import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';

class HeaderAction {
    constructor() {
        this.generateActions(
            'clearStore',
            'searchOptionsSuccess',
            'setLoaderAndValue',
            'resetData',
            'setActiveNavLink'
        );
    }

    searchOptions(value, userId) {
        const url = 'app-settings/search-options';
        const data = {
            query: value,
            userId
        };
       
        RequestHandler.post(url, data).then((options) => {
            this.searchOptionsSuccess(options);
        });
    }
}

export default alt.createActions(HeaderAction);
