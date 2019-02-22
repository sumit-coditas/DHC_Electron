import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import indexOf from 'lodash/indexOf';
import map from 'lodash/map';
import merge from 'lodash/merge';

import AppAction from '../actions/AppAction.js';
import alt from '../alt.js';
import { EmployeeModel } from '../model/AppModels/EmployeeModel.js';
import { TagModel } from '../model/AppModels/TagModel.js';
import { RoleModel } from '../model/AppModels/RoleModel';
import { WorkloadModel } from '../model/AppModels/WorkloadModel';
import { LocationModel } from '../model/AppModels/LocationModel';
import { ItemTypeModel } from '../model/AppModels/ItemTypeModel.js';
import { sortByDate, sortByDateAsc } from '../utils/DateUtils.js';
import { sortItemTypes } from '../utils/sortUtil.js';

class AppStore {
    constructor() {
        this.bindActions(AppAction);
        this.clearStore();
    }

    clearStore() {
        this.showNotification = false;
        this.isError = false;
        this.error = {
            code: 0,
            message: ''
        };
        this.notification = {
            message: '',
            level: ''
        };
        this.appSettings = null;
        this.locations = [];
        this.roles = [];
        this.workloads = [];
        this.users = [];
        this.OnlineUsers = [];
        this.itemTypes = [];
        this.tags = [];
        this.showAttachmentForm = false;
        this.isAddAttachment = false;
        this.isAttachmentLoading = false;
        this.showContractorsForm = false;
        this.isContractorsFormLoading = false;
        this.attachment = {
            name: ''
        };
        this.attachmentError = {
            name: ''
        };
        this.contractorsFormError = {
            name: ''
        };
        this.singInUsers = [];
        this.viewContextMenu = null;
    }

    getMasterDataSuccess(masterData) {
        const self = this;
        this.appSettings = masterData.appSettings;
        this.locations = masterData.locations;
        this.roles = masterData.roles;
        this.workloads = masterData.workloads;
        // new UserModel({
        //     allUsers: masterData.users
        // }).$save();
        this.users = masterData.users;
        if (this.OnlineUsers.length > 0) {
            let users = filter(this.users, (user) => {
                return find(this.OnlineUsers, (id) => {
                    return id === user.id;
                });
            });
            forEach(users, (user) => {
                user.isOnline = true;
            });
        }
        this.itemTypes = masterData.itemTypes;
        this.tags = map(masterData.tags, (tag) => {
            return {
                id: tag.id,
                value: tag._id,
                label: tag.name
            };
        });
        TagModel.saveAll(this.tags.map(item => new TagModel(item)));
        EmployeeModel.saveAll(this.users.map(item => new EmployeeModel(item)));
        RoleModel.saveAll(this.roles.map(item => new RoleModel(item)));
        WorkloadModel.saveAll(this.workloads.map(item => new WorkloadModel(item)));
        LocationModel.saveAll(this.locations.map(item => new LocationModel(item)));
        ItemTypeModel.saveAll(sortItemTypes(this.itemTypes).map(item => new ItemTypeModel(item)));
        self.viewContextMenu = {};
        forEach(masterData.users, (user) => {
            self.viewContextMenu[user.id] = false;
        });
    }

    socketUserUpdate(updatedUser) {
        let self = this;
        let user = find(self.users, { id: updatedUser.id });
        if (user) {
            user = merge(user, updatedUser);
        }
        user.isOnline = true;
        if (user.locationInfo.location.name === 'Lunch' || user.locationInfo.location.name === 'Meeting' || user.locationInfo.location.name === 'Off') {
            user.isOnline = false;
        }
        // let index = indexOf(self.users, find(self.users, { id: updatedUser.id }));
        // if (index >= 0) {
        //     self.users.splice(index, 1, user);
        // }
    }

    updateUserOtherUser(user) {
        const selectedUser = this.users.find(item => item._id === user._id);
        if (!selectedUser) {
            return;
        }
        selectedUser.nonUrgentHours = user.nonUrgentHours;
        selectedUser.urgentHours = user.urgentHours;
    }

    showError(error) {
        this.showNotification = true;
        this.isError = true;
        this.error = error;
    }

    hideError() {
        this.showNotification = false;
        this.error = {
            code: 0,
            message: ''
        };
    }

    showNotification(notification) {
        this.showNotification = true;
        this.isError = false;
        this.notification = notification;
    }

    hideNotification() {
        this.showNotification = false;
        this.isError = false;
        this.notification = {
            message: '',
            level: ''
        };
    }

    updatedAppSettingSuccess(updatedAppSetting) {
        this.appSettings = updatedAppSetting;
    }

    showAddAttachmentForm() {
        this.showAttachmentForm = true;
        this.isAddAttachment = true;
        this.isAttachmentLoading = false;
        this.attachment = {
            name: ''
        };
        this.attachmentError = {
            name: ''
        };
    }

    closeAttachmentForm() {
        this.resetAttachmentData();
    }

    closeContractorsForm() {
        this.resetContractorsFormData();
    }

    resetAttachmentData() {
        this.showAttachmentForm = false;
        this.isAddAttachment = false;
        this.isAttachmentLoading = false;
        this.attachment = {
            name: ''
        };
        this.attachmentError = {
            name: ''
        };
    }

    resetContractorsFormData() {
        this.showContractorsForm = false;
        this.isContractorsFormLoading = false;
        this.contractorsFormError = {
            name: ''
        };
    }

    setAttachmentError(error) {
        this.attachmentError = error;
    }

    setContractorsFormError(error) {
        this.contractorsFormError = error;
    }

    setAttachmentLoader() {
        this.isAttachmentLoading = true;
    }

    setContractorsFormLoader() {
        this.isContractorsFormLoading = true;
    }

    showUpdateAttachmentForm(attachment) {
        this.showAttachmentForm = true;
        this.isAddAttachment = false;
        this.isAttachmentLoading = false;
        this.attachmentError = {
            name: ''
        };
        this.attachment = cloneDeep(attachment);
    }

    showUpdateContractorsForm() {
        this.showContractorsForm = true;
        this.isContractorsFormLoading = false;
        this.contractorsFormError = {
            name: ''
        };
    }

    addNewTagSuccess(tag) {
        this.tags.push({
            value: tag._id,
            label: tag.name
        });
    }

    changeAttachment(newAttachmentName) {
        this.attachment.name = newAttachmentName;
    }

    addItemTypeBySocketSuccess(itemType) {
        let index = indexOf(this.itemTypes, find(this.itemTypes, { id: itemType.id }));
        if (index === -1 && itemType) {
            this.itemTypes.push(itemType);
        }
    }

    updateItemTypeBySocketSuccess(updatedItemType) {
        let index = indexOf(this.itemTypes, find(this.itemTypes, { id: updatedItemType.id }));
        this.itemTypes.splice(index, 1, updatedItemType);
    }

    setUserOnlineStatus(payload) {
        if (Array.isArray(payload.userId)) {
            if (this.users.length === 0) {
                this.OnlineUsers = payload.userId;
                return;
            }
            this.OnlineUsers = [];
            let users = filter(this.users, (user) => {
                return find(payload.userId, (id) => {
                    return id === user.id;
                });
            });
            forEach(users, (user) => {
                user.isOnline = true;
            });
        } else {
            this.OnlineUsers = [];
            let user = find(this.users, { id: payload.userId });
            if (user) {
                user.isOnline = payload.isOnline;
            }
        }
    }

    showContextMenu(payload) {
        this.viewContextMenu[payload.userId] = payload.bool;
    }
}

export default alt.createStore(AppStore, 'AppStore');
