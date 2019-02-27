import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';

import AppAction from '../actions/AppAction.js';
import PermissionAction from '../actions/PermissionAction.js';

class RoleLevelAction {
    constructor() {
        this.generateActions('clearStore', 'getLevelsSuccess', 'showAddLevelForm', 'closeLevelForm', 'updateLevelName', 'setLoader', 'setError', 'addLevelSuccess', 'showUpdateLevelForm', 'updateLevelSuccess', 'resetLoaderAndError');
    }

    getLevels() {
        let url = 'roleLevels';

        RequestHandler.get(url).then((levels) => {
            this.getLevelsSuccess(levels);
        });
    }

    addLevel(level) {
        let url = 'roleLevels';

        RequestHandler.post(url, level).then((newLevel) => {
            this.addLevelSuccess(newLevel);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ROLE_LEVEL.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            this.resetLoaderAndError();
        });
    }

    updateLevel(level) {
        let url = 'roleLevels/' + level.id;
        let data = {
            name: level.name
        };

        RequestHandler.put(url, data).then((updatedLevel) => {
            this.updateLevelSuccess(updatedLevel);
            PermissionAction.updateRoleLevel(updatedLevel);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ROLE_LEVEL.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            this.resetLoaderAndError();
        });
    }
}

export default alt.createActions(RoleLevelAction);
