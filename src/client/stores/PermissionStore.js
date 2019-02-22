import find from 'lodash/find';
import remove from 'lodash/remove';
import map from 'lodash/map';
import indexOf from 'lodash/indexOf';

import alt from '../alt.js';

import PermissionAction from '../actions/PermissionAction.js';

class PermissionStore {
    constructor() {
        this.bindActions(PermissionAction);
        this.clearStore();
    }

    clearStore() {
        this.isLoading = true;
        this.accessData = [];
        this.showForm = false;
        this.isAddPermission = false;
        this.permissionsAvailable = [];
        this.error = {
            role: '',
            permissions: ''
        };
        this.permission = {
            role: null,
            level: null,
            permissions: []
        };
    }

    getAccessDataSuccess(accessData) {
        this.accessData = accessData;
    }

    getPermissionsSuccess(permissions) {
        this.permissionsAvailable = permissions;
        this.isLoading = false;
    }

    showAddPermissionForm() {
        this.showForm = true;
        this.isAddPermission = true;
        this.permission = {
            role: null,
            level: null,
            permissions: []
        };
    }

    closePermissionForm() {
        this.showForm = false;
        this.error = {
            role: '',
            permissions: ''
        };
        this.permission = {
            role: null,
            level: null,
            permissions: []
        };
    }

    selectRole(role) {
        this.permission.role = role;
    }

    selectRoleLevel(roleLevel) {
        this.permission.level = roleLevel;
    }

    selectPermission(payload) {
        let hasPermission = find(this.permission.permissions, (permission) => {
            return payload.permission._id === permission.permission;
        });

        if (hasPermission) {
            if (payload.value === 'read') {
                hasPermission.read = true;
                hasPermission.write = false;
            } else if (payload.value === 'write') {
                hasPermission.read = true;
                hasPermission.write = true;
            } else {
                remove(this.permission.permissions, (permission) => {
                    return payload.permission._id === permission.permission;
                });
            }
        } else {
            let newPermission = {
                permission: payload.permission._id
            };
            if (payload.value === 'read') {
                newPermission.read = true;
                newPermission.write = false;
            } else if (payload.value === 'write') {
                newPermission.read = true;
                newPermission.write = true;
            }
            this.permission.permissions.push(newPermission);
        }
    }

    savePermissionSuccess(savedPermission) {
        this.accessData.push(savedPermission);
        this.showForm = false;
        this.error = {
            role: '',
            permissions: ''
        };
        this.isLoading = false;
        this.permission = {
            role: null,
            level: null,
            permissions: []
        };
    }

    showUpdatePermissionForm(accessibility) {
        this.showForm = true;
        this.isAddPermission = false;
        this.error = {
            role: '',
            permissions: ''
        };
        this.permission = {
            id: accessibility.id,
            role: accessibility.role._id,
            level: null,
            permissions: []
        };
        if (accessibility.level) {
            this.permission.level = accessibility.level._id;
        }

        map(accessibility.permissions, (permission) => {
            this.permission.permissions.push({ permission: permission.permission._id, read: permission.read, write: permission.write });
        });
    }

    updatePermissionSuccess(updatedAccessibility) {
        let index = indexOf(this.accessData, find(this.accessData, { id: updatedAccessibility.id }));
        this.accessData.splice(index, 1, updatedAccessibility);
        this.showForm = false;
        this.error = {
            role: '',
            permissions: ''
        };
        this.isLoading = false;
        this.permission = {
            role: null,
            level: null,
            permissions: []
        };
    }

    setError(error) {
        this.error = error;
    }

    setLoader() {
        this.isLoading = true;
    }

    resetLoaderAndError() {
        this.isLoading = false;
        this.error = {
            role: '',
            permissions: ''
        };
    }

    updateRoleLevel(updatedRoleLevel) {
        let self = this;
        let updatedData;
        if (self.accessData) {
            updatedData = find(self.accessData, (data) => {
                return data.level && data.level.id === updatedRoleLevel.id;
            });

            if (updatedData) {
                updatedData.level = updatedRoleLevel;
            }
        }
    }
}

export default alt.createStore(PermissionStore, 'PermissionStore');
