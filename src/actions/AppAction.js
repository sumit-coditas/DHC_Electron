import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';

import TaskAction from './TaskAction.js';

class AppAction {
    constructor() {
        this.generateActions('clearStore', 'getMasterDataSuccess', 'showError', 'hideError', 'showNotification', 'addItemTypeBySocketSuccess',
            'hideNotification', 'updatedAppSettingSuccess', 'showAddAttachmentForm', 'closeAttachmentForm', 'closeContractorsForm', 'updateItemTypeBySocketSuccess',
            'resetAttachmentData', 'resetContractorsFormData', 'setAttachmentError', 'setAttachmentLoader', 'showUpdateAttachmentForm', 'changeAttachment',
            'getSlackAuthUrlSuccess', 'getSlackAccessTokenSuccess', 'addNewTagSuccess', 'showUpdateContractorsForm', 'setContractorsFormLoader', 'socketUserUpdate', 'setUserOnlineStatus', 'showContextMenu', 'updateUserOtherUser');
    }

    getMasterData() {
        let url = 'app-settings/master-data';

        RequestHandler.get(url).then((masterData) => {
            this.getMasterDataSuccess(masterData);
        });
    }

    updatedAppSetting(appSetting) {
        let url = 'app-settings';

        RequestHandler.put(url, appSetting).then((updatedAppSetting) => {
            this.updatedAppSettingSuccess(updatedAppSetting);
            this.resetAttachmentData();
            this.resetContractorsFormData();
        }).catch(() => {
            this.resetAttachmentData();
        });
    }

    addNewTag(tagName, task) {
        let url = 'tag';
        let data = {
            name: tagName
        };

        RequestHandler.post(url, data).then((tag) => {
            this.addNewTagSuccess(tag);
            task.tags.push(tag._id);
            TaskAction.updateTask(task, 'Tag added successfully');
        });
    }
}

export default alt.createActions(AppAction);
