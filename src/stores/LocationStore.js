import forEach from 'lodash/forEach';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

import alt from '../alt.js';

import LocationAction from '../actions/LocationAction.js';

class LocationStore {
    constructor() {
        this.bindActions(LocationAction);
        this.clearStore();
    }

    clearStore() {
        this.newLocation = {
            name: '',
            icon: '',
            iconColor: ''
        };
        this.error = {};
        this.addLocation = false;
        this.locations = [];
        this.isAddLoader = true;
        this.editedLocation = '';
        this.isEditLocation = false;
    }

    setLoader() {
        this.isAddLoader = true;
    }

    getLocationSuccess(locations) {
        this.locations = locations;
        this.isAddLoader = false;
    }

    addLocationSuccess(payload) {
        if (!payload.isEditLocation) {
            this.locations.push(payload.location);
        } else {
            forEach(this.locations, function(loc) {
                if (loc.id === payload.location.id) {
                    merge(loc, payload.location);
                }
            });
        }
        this.addLocation = false;
        this.error = {};
        this.isAddLoader = false;
    }

    addLocationFail(err) {
        this.isAddLoader = false;
        this.error = {};
    }

    editLocation(location) {
        this.addLocation = true;
        this.newLocation = cloneDeep(location);
        this.isEditLocation = true;
    }

    updateLocation(payload) {
        this.error = {};
        if (payload.type === 'name') {
            this.newLocation.name = payload.value;
        } else if (payload.type === 'color') {
            this.newLocation.iconColor = payload.value;
        } else {
            this.newLocation.icon = payload.value;
        }
    }

    showLocationForm() {
        this.addLocation = true;
        this.isEditLocation = false;
        this.newLocation = {
            name: '',
            icon: '',
            iconColor: ''
        };
        this.error = {};
    }

    closeLocationForm() {
        this.addLocation = false;
        this.isEditLocation = false;
        this.newLocation = {
            name: '',
            icon: '',
            iconColor: ''
        };
        this.error = {};
    }

    setError(errorMsg) {
        this.isAddLoader = false;
        this.error = errorMsg;
    }
}

export default alt.createStore(LocationStore, 'LocationStore');
