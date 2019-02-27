import alt from '../alt.js';
import RequestHandler from '../components/helpers/RequestHandler.js';
import AppAction from '../actions/AppAction.js';
import Constant from '../components/helpers/Constant.js';
class CustomerPageAction {
    constructor() {
        this.generateActions(
            'setLoading',
            'resetStore',
            'getCustomerTaskSuccess'
        );
    }
    // get new access token
    getAccessToken() {
        RequestHandler.get('office/access-token-for-customer').then(() => {
            this.setLoading(true);
            this.getCustomerTask('GME, Inc');
        }).catch(err => {
            AppAction.showNotification({
                message: 'Forbidden: Access is denied',
                level: Constant.NOTIFICATION_LEVELS.SUCCESS
            });
        });
    }

    getCustomerTask(companyName) {
        let url = 'tasks/getScopesAndContactsOfCustomer';
        let data = {
            companyName
        };
        RequestHandler.post(url, data).then((data) => {
            this.getCustomerTaskSuccess(data);
        }).catch((error) => {
            this.resetStore();
            console.log(error);
        });
    }
}
export default alt.createActions(CustomerPageAction);
