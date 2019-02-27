import alt from '../alt.js';

import TeamHeaderAction from '../actions/TeamHeaderAction.js';

class TeamHeaderStore {
    constructor() {
        this.bindActions(TeamHeaderAction);
        this.clearStore();
    }

    clearStore() {
        this.groupByType = 'Role Type';
        this.viewMode = {
            name: true,
            location: true,
            availability: true,
            urgent: true,
            nonUrgent: true
        };
        this.showPayDayModal = true;
    }

    setGroupBy(type) {
        this.groupByType = type;
    }

    toggleAvatarView(viewType) {
        this.viewMode[viewType] = !this.viewMode[viewType];
    }

    setShowPayDayModal(value) {
        this.showPayDayModal = value;
    }
}

export default alt.createStore(TeamHeaderStore, 'TeamHeaderStore');
