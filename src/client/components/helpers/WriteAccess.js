import find from 'lodash/find';

import Constant from './Constant.js';

import LoginStore from '../../stores/LoginStore.js';

export default class WriteAccess {
    static hasAccess(permissionName) {
        let user = LoginStore.getState().user;
        let hasAccess = false;

        if (user) {
            let hasPermission = find(user.permissions, function (permission) {
                return permission.permission.name === permissionName && permission.permission.isActive;
            });

            if (hasPermission && hasPermission[Constant.ACCESS_LEVELS.WRITE]) {
                hasAccess = true;
            }
        }

        return hasAccess;
    }
}
