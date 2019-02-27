import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';

import AppAction from '../actions/AppAction.js';

class RoleAction {
    constructor() {
        this.generateActions('clearStore',
            'setLoader',
            'getRolesSuccess',
            'addNewRoleSuccess',
            'updateRoleName',
            'showAddRoleForm',
            'showUpdateRoleForm',
            'closeRoleForm',
            'updateRoleSuccess',
            'setError',
            'resetLoaderAndError'
        );
    }

    getRoles() {
        let url = 'roles';

        RequestHandler.get(url).then((roles) => {
            this.getRolesSuccess(roles);
        });
    }

    addNewRole(role) {
        let url = 'roles';

        RequestHandler.post(url, role).then((newRole) => {
            this.addNewRoleSuccess(newRole);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ROLE.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            this.resetLoaderAndError();
        });
    }

    updateRole(role) {
        let url = 'roles/' + role.id;

        RequestHandler.put(url, role).then((updatedRole) => {
            this.updateRoleSuccess(updatedRole);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ROLE.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            this.resetLoaderAndError();
        });
    }

    updateWorkLoad(role) {
        let url = 'roles/groupstatus/' + role.id;

        RequestHandler.put(url, role).then((updatedRole) => {
            this.updateRoleSuccess(updatedRole);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ROLE.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            this.resetLoaderAndError();
        });
    }
}

export default alt.createActions(RoleAction);
