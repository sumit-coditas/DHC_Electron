import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';

import AppAction from '../actions/AppAction.js';

class WorkloadAction {
    constructor() {
        this.generateActions('clearStore', 'editWorkload', 'getWorkloadsSuccess', 'addWorkloadSuccess', 'addWorkloadFail',
            'setError', 'updateWorkload', 'showWorkloadForm', 'closeWorkloadForm', 'setLoader');
    }

    getWorkloads() {
        let url = 'workloads';

        RequestHandler.get(url).then((workloads) => {
            this.getWorkloadsSuccess(workloads);
        });
    }

    saveEditedWorkload(payload) {
        let url = 'workloads/' + payload.id;
        let data = payload;

        RequestHandler.put(url, data).then((workload) => {
            this.addWorkloadSuccess({ workload: workload, isEditWorkload: true });
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.WORKLOAD.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            this.addWorkloadFail(err);
        });
    }

    addNewWorkload(payload) {
        let url = 'workloads';
        let data = payload;

        RequestHandler.post(url, data).then((newWorkload) => {
            this.addWorkloadSuccess({ workload: newWorkload });
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.WORKLOAD.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((err) => {
            this.addWorkloadFail(err);
        });
    }
}

export default alt.createActions(WorkloadAction);
