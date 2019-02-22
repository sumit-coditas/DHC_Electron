import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import indexOf from 'lodash/indexOf';
import alt from '../alt.js';

import RoleAction from '../actions/RoleAction.js';

class RoleStore {
    constructor() {
        this.bindActions(RoleAction);
        this.clearStore();
    }

    clearStore() {
        this.roles = [];
        this.role = {
            name: ''
        };
        this.showForm = false;
        this.isLoaderActive = true;
        this.isAddRole = false;
        this.error = {
            name: ''
        };
    }

    getRolesSuccess(roles) {
        this.roles = roles;
        this.isLoaderActive = false;
    }

    addNewRoleSuccess(newRole) {
        this.roles.push(newRole);
        this.showForm = false;
        this.error = {
            name: ''
        };
        this.role = {
            name: ''
        };
        this.isLoaderActive = false;
    }

    setLoader() {
        this.isLoaderActive = true;
    }

    updateRoleName(newName) {
        this.role.name = newName;
    }

    showAddRoleForm() {
        this.showForm = true;
        this.isAddRole = true;
        this.role = {
            name: ''
        };
    }

    showUpdateRoleForm(role) {
        this.showForm = true;
        this.isAddRole = false;
        this.role = cloneDeep(role);
    }

    closeRoleForm() {
        this.showForm = false;
        this.error = {
            name: ''
        };
        this.role = {
            name: ''
        };
    }

    updateRoleSuccess(updatedRole) {
        let index = indexOf(this.roles, find(this.roles, { id: updatedRole.id }));
        this.roles.splice(index, 1, updatedRole);
        this.showForm = false;
        this.role = {
            name: ''
        };
        this.error = {
            name: ''
        };
        this.isLoaderActive = false;
    }

    setError(error) {
        this.error = error;
        this.isLoaderActive = false;
    }

    resetLoaderAndError() {
        this.isLoaderActive = false;
        this.error = {
            name: ''
        };
    }
}

export default alt.createStore(RoleStore, 'RoleStore');
