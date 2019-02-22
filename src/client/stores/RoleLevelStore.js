import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import indexOf from 'lodash/indexOf';
import alt from '../alt.js';

import RoleLevelAction from '../actions/RoleLevelAction.js';

class RoleLevelStore {
    constructor() {
        this.bindActions(RoleLevelAction);
        this.clearStore();
    }

    clearStore() {
        this.levels = [];
        this.showForm = false;
        this.isAddLevel = false;
        this.isFormLoading = true;
        this.error = {
            name: ''
        };
        this.roleLevel = {
            name: ''
        };
    }

    getLevelsSuccess(levels) {
        this.levels = levels;
        this.isFormLoading = false;
    }

    resetData() {
        this.roleLevel = {
            name: ''
        };
        this.error = {
            name: ''
        };
    }

    showAddLevelForm() {
        this.showForm = true;
        this.isAddLevel = true;
        this.resetData();
    }

    closeLevelForm() {
        this.showForm = false;
        this.resetData();
    }

    updateLevelName(newName) {
        this.roleLevel.name = newName;
    }

    setLoader() {
        this.isFormLoading = true;
    }

    addLevelSuccess(level) {
        this.levels.push(level);
        this.showForm = false;
        this.isFormLoading = false;
        this.resetData();
    }

    showUpdateLevelForm(level) {
        this.showForm = true;
        this.isAddLevel = false;
        this.roleLevel = cloneDeep(level);
        this.error = {
            name: ''
        };
    }

    updateLevelSuccess(updateLevel) {
        let index = indexOf(this.levels, find(this.levels, { id: updateLevel.id }));
        this.levels.splice(index, 1, updateLevel);
        this.showForm = false;
        this.isFormLoading = false;
        this.resetData();
    }

    setError(error) {
        this.error = error;
        this.isFormLoading = false;
    }

    resetLoaderAndError() {
        this.isFormLoading = false;
        this.error = {
            name: ''
        };
    }
}

export default alt.createStore(RoleLevelStore, 'RoleLevelStore');
