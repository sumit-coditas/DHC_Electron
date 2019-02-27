import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import merge from 'lodash/merge';
import alt from '../alt.js';

import WorkloadAction from '../actions/WorkloadAction.js';

class WorkloadStore {
    constructor() {
        this.bindActions(WorkloadAction);
        this.clearStore();
    }

    clearStore() {
        this.newWorkload = {
            name: '',
            color: ''
        };
        this.addWorkload = false;
        this.isAddLoader = true;
        this.workloads = [];
        this.error = {};
        this.isEditWorkload = false;
    }

    showWorkloadForm() {
        this.addWorkload = true;
        this.newWorkload = {
            name: '',
            color: ''
        };
        this.error = {};
    }

    closeWorkloadForm() {
        this.addWorkload = false;
        this.newWorkload = {
            name: '',
            color: ''
        };
        this.error = {};
    }

    updateWorkload(payload) {
        if (payload.type === 'name') {
            this.newWorkload.name = payload.value;
        } else {
            this.newWorkload.color = payload.value;
        }
    }

    setLoader() {
        this.isAddLoader = true;
    }

    setError(errorMsg) {
        this.isAddLoader = false;
        this.error = errorMsg;
    }

    getWorkloadsSuccess(workloads) {
        this.workloads = workloads;
        this.isAddLoader = false;
    }

    editWorkload(workload) {
        this.addWorkload = true;
        this.isEditWorkload = true;
        this.newWorkload = cloneDeep(workload);
    }

    addWorkloadSuccess(payload) {
        if (!payload.isEditWorkload) {
            this.workloads.push(payload.workload);
        } else {
            forEach(this.workloads, function(work) {
                if (work.id === payload.workload.id) {
                    merge(work, payload.workload);
                }
            });
        }
        this.addWorkload = false;
        this.isAddLoader = false;
        this.isEditWorkload = false;
        this.error = {};
    }

    addWorkloadFail(err) {
        this.isAddLoader = false;
        this.error = {};
    }
}

export default alt.createStore(WorkloadStore, 'WorkloadStore');
