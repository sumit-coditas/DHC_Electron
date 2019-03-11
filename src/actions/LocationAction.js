import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';

import AppAction from '../actions/AppAction.js';

class LocationAction {
    constructor() {
        this.generateActions('clearStore', 'editLocation', 'setLoader', 'getLocationSuccess', 'addLocationSuccess',
            'addLocationFail', 'addNewLocationSuccess', 'updateLocation', 'showLocationForm', 'closeLocationForm', 'setError');
    }

    getLocation() {
        let url = 'locations';
        RequestHandler.get(url).then((locations) => {
            this.getLocationSuccess(locations);
        });
    }

    saveEditedLocation(payload) {
        let url = 'locations/' + payload.id;
        let data = payload;
        RequestHandler.put(url, data).then((location) => {
            this.addLocationSuccess({ location: location, isEditLocation: true });
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.LOCATION.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            this.addLocationFail(err);
        });
    }

    addNewLocation(payload) {
        let url = 'locations';
        let data = payload;
        RequestHandler.post(url, data).then((location) => {
            this.addLocationSuccess({ location: location });
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.LOCATION.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            this.addLocationFail(err);
        });
    }
}
export default alt.createActions(LocationAction);
