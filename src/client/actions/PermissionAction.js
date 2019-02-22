import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';

class PermissionAction {
    constructor() {
        this.generateActions('clearStore', 'getAccessDataSuccess', 'getPermissionsSuccess', 'showAddPermissionForm', 'closePermissionForm', 'selectRole', 'selectRoleLevel', 'selectPermission', 'savePermissionSuccess', 'showUpdatePermissionForm', 'updatePermissionSuccess', 'setError', 'setLoader', 'resetLoaderAndError', 'updateRoleLevel');
    }

    getAccessData() {
        let url = 'accessibilities';

        RequestHandler.get(url).then((accessData) => {
            this.getAccessDataSuccess(accessData);
        });
    }

    getPermissions() {
        let url = 'permissions';

        RequestHandler.get(url).then((permissions) => {
            this.getPermissionsSuccess(permissions);
        });
    }

    savePermission(permission) {
        let url = 'accessibilities';

        RequestHandler.post(url, permission).then((savedPermission) => {
            this.savePermissionSuccess(savedPermission);
        }).catch((err) => {
            this.resetLoaderAndError();
        });
    }

    updatePermission(permission) {
        let url = 'accessibilities/' + permission.id;

        RequestHandler.put(url, permission).then((updatedAccessibility) => {
            this.updatePermissionSuccess(updatedAccessibility);
        }).catch((err) => {
            this.resetLoaderAndError();
        });
    }
}

export default alt.createActions(PermissionAction);
