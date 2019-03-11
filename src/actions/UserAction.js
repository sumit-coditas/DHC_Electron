import async from 'async';
import axios from 'axios';
import shortid from 'shortid';
import moment from 'moment';
import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';

import cloneDeep from 'lodash/cloneDeep';

import AppAction from '../actions/AppAction.js';
import LoginAction from '../actions/LoginAction.js';
import TaskAction from './TaskAction.js';
import { DrafterAdminModal } from '../model/payDayModels/DrafterAdminModal.js';

class UserAction {
    constructor() {
        this.generateActions(
            'clearStore',
            'resetUser',
            'toggleEditMode',
            'handleMenuItem',
            'getUserSuccess',
            'showUpdateUserForm',
            'getUsersSuccess',
            'setCropResult',
            'toggleTotalHoursView',
            'setError',
            'setLoader',
            'showAddUserForm',
            'addUserSuccess',
            'closeUserForm',
            'resetData',
            'updateUserSuccess',
            'setProfilePicture',
            'showImage',
            'getHourTrackersSuccess',
            'updateHourTrackerSuccess',
            'getTasksSuccess',
            'toggleModel',
            'updateSelectedTask',
            'addHourTrackerSuccess',
            'toggleImageError',
            'filterHourTracker',
            'sortHourTrackers',
            'changeHourSpent',
            'changeNote',
            'toggleTaskView',
            'updateOtherValue',
            'resetCheckBoxValues',
            'resetCroppingModal',
            'setDeleteMode',
            'deleteHourTrackerSuccess',
            'changeUser',
            'updateHourTrackerBySocketSuccess',
            'setSignature',
            'setInitials',
            'setTitleBlock',
            'searchTaskSuccess',
            'toggleFetchingTask',
            'searchScopesSuccess',
            'getUserScopesSuccess',
            'addHourTrackerRow',
            'toggleMultipleEntriesModal',
            'changeHourTrackerDate',
            'changeSelectedTaskForBulkEntry',
            'changeSelectedScopeForBulkEntry',
            'changeRevNumberForBulkEntry',
            'changeOtherForBulkEntry',
            'changeHoursSpentForBulkEntry',
            'changeNoteForBulkEntry',
            'addHourTrackerRow',
            'deleteHourTrackerRow',
            'setBulkHourTrackerFormLoader',
            'addMultipleHourTrackersSuccess',
            'changeTaskOrOtherPreference',
            'removeBlankHourTrackerRows',
            'resetError',
            'updateHourSpent',
            'getUserTasksSuccess',
            'updateUsersSuccess'
        );
    }

    addUser(payload) {
        let self = this;
        let user = payload.user;
        let file = payload.picture;
        let signature = payload.signature;
        let initials = payload.initials;
        let titleBlock = payload.titleBlock;

        async.waterfall([
            function (callback) {
                if (file) {
                    self.uploadFile(file, Constant.BUCKET_NAMES.PICTURE, (err, fileUrl) => {
                        if (!err) {
                            user.picture = fileUrl;
                            callback(null);
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                if (signature) {
                    self.uploadFile(signature, Constant.BUCKET_NAMES.TITLE, (err, fileUrl) => {
                        if (!err) {
                            user.signature = fileUrl;
                            callback(null);
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                if (initials) {
                    self.uploadFile(initials, Constant.BUCKET_NAMES.TITLE, (err, fileUrl) => {
                        if (!err) {
                            user.initials = fileUrl;
                            callback(null);
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                if (titleBlock) {
                    self.uploadFile(titleBlock, Constant.BUCKET_NAMES.TITLE, (err, fileUrl) => {
                        if (!err) {
                            user.titleBlock = fileUrl;
                            callback(null);
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                let url = 'users';

                RequestHandler.post(url, user).then((user) => {
                    callback(null, user);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, user) {
            if (!err) {
                self.addUserSuccess(user);
                AppAction.showNotification({
                    message: Constant.NOTIFICATION_MESSAGES.USER.ADD_SUCCESS,
                    level: Constant.NOTIFICATION_LEVELS.SUCCESS
                });
            } else {
                self.resetData();
            }
        });
    }

    updateUser(payload) {
        let self = this;
        let user = payload.user;
        let id = payload.id;
        let file = payload.picture;
        let signature = payload.signature;
        let initials = payload.initials;
        let titleBlock = payload.titleBlock;
        async.waterfall([
            function (callback) {
                if (file) {
                    self.uploadFile(file, Constant.BUCKET_NAMES.PICTURE, (err, fileUrl) => {
                        if (!err) {
                            user.picture = fileUrl;
                            callback(null);
                        } else {
                            delete user.picture;
                            callback(err);
                        }
                    });
                } else {
                    delete user.picture;
                    callback(null);
                }
            },
            function (callback) {
                if (signature) {
                    self.uploadFile(signature, Constant.BUCKET_NAMES.TITLE, (err, fileUrl) => {
                        if (!err) {
                            user.signature = fileUrl;
                            callback(null);
                        } else {
                            delete user.signature;
                            callback(err);
                        }
                    });
                } else {
                    delete user.signature;
                    callback(null);
                }
            },
            function (callback) {
                if (initials) {
                    self.uploadFile(initials, Constant.BUCKET_NAMES.TITLE, (err, fileUrl) => {
                        if (!err) {
                            user.initials = fileUrl;
                            callback(null);
                        } else {
                            delete user.initials;
                            callback(err);
                        }
                    });
                } else {
                    delete user.initials;
                    callback(null);
                }
            },
            function (callback) {
                if (titleBlock) {
                    self.uploadFile(titleBlock, Constant.BUCKET_NAMES.TITLE, (err, fileUrl) => {
                        if (!err) {
                            user.titleBlock = fileUrl;
                            callback(null);
                        } else {
                            delete user.titleBlock;
                            callback(err);
                        }
                    });
                } else {
                    delete user.titleBlock;
                    callback(null);
                }
            },
            function (callback) {
                let url = 'users/' + id;

                RequestHandler.put(url, user).then((updatedUser) => {
                    callback(null, updatedUser);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], (err, updatedUser) => {
            if (!err) {
                self.updateUserSuccess(updatedUser);
                if (payload.loggedInUserID === updatedUser.id) {
                    LoginAction.updateLoggedInUserSuccess(updatedUser);
                }
                AppAction.showNotification({
                    message: Constant.NOTIFICATION_MESSAGES.USER.UPDATE_SUCCESS,
                    level: Constant.NOTIFICATION_LEVELS.SUCCESS
                });
            } else {
                self.resetData();
            }
        });
    }

    updateUsers(users) {
        const url = 'utilApi/update-multiple';
        RequestHandler.post(url, users).then(updatedUsers => {
            this.updateUsersSuccess(updatedUsers);
        }).catch(error => {
            console.error('Unable to update users:', error);
            this.resetData();
        });
    }

    uploadFile(file, bucketName, callback) {
        let url = 'users/signedUrl';
        let fileExtension = file.name.split('.').pop();
        let fileName = shortid.generate() + '.' + fileExtension;
        let data = {
            fileName: fileName,
            fileType: file.type,
            bucketName: bucketName
        };
        let config = {
            headers: {
                'Content-Type': file.type
            }
        };
        RequestHandler.post(url, data).then((signedUrl) => {
            axios.put(signedUrl, file, config).then(function () {
                let fileUrl = 'https://' + bucketName + '.s3.amazonaws.com/' + fileName;
                callback(null, fileUrl);
            }).catch(function (err) {
                callback(err);
            });
        }).catch((err) => {
            callback(err);
        });
    }

    getUsers() {
        let url = 'users';

        RequestHandler.get(url).then((users) => {
            this.getUsersSuccess(users);
        });
    }

    getUser(userId) {
        let url = 'users/' + userId;

        RequestHandler.get(url).then((user) => {
            this.getUserSuccess(user);
        });
    }

    getHourTrackers(userId, year, month) {
        let self = this;
        let url = 'hourTracker/user/' + userId + '/' + year + '/' + month;

        RequestHandler.get(url).then((data) => {
            data.year = year;
            data.month = month;
            DrafterAdminModal.saveAll(data.drafterAdminData.map(item => new DrafterAdminModal(item)));
            setTimeout(self.getHourTrackersSuccess(data), 1000);
        }).catch((err) => {
            console.log(err);
            self.resetData();
        });
    }

    updateHourTracker(hourTracker) {
        let self = this;
        let url = 'hourTracker/' + hourTracker.id;

        RequestHandler.put(url, hourTracker).then((updatedHourTrackers) => {
            self.updateHourTrackerSuccess(updatedHourTrackers);
            if (updatedHourTrackers.scope && updatedHourTrackers.scope.group) {
                TaskAction.updateHourTrackerForGridScope(updatedHourTrackers);
            } else if (updatedHourTrackers.scopeID && updatedHourTrackers.groupID) {
                TaskAction.updateHourTrackerByGroupId(updatedHourTrackers);
            }
            TaskAction.toggleAddHourTrackerModal(false);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((e) => {
            console.log(e);
            self.resetData();
        });
    }

    deleteHourTracker(hourTracker) {
        let self = this;
        let url = 'hourTracker/' + hourTracker._id;
        RequestHandler.delete(url).then((deleteHourTrackerSuccess) => {
            self.deleteHourTrackerSuccess(hourTracker);
            TaskAction.deleteHourTrackerInScope(hourTracker);
        }).catch((deleteHourTrackerError) => {
            self.resetData();
        });
    }

    // getTasks() {
    //     let self = this;
    //     let url = 'tasks';

    //     RequestHandler.get(url).then((tasks) => {
    //         self.getTasksSuccess(tasks);
    //     }).catch(() => {
    //         self.getTasksSuccess([]);
    //     });
    // }

    addMultipleHourTrackers(multipleHourTrackers) {
        let self = this;
        let url = 'hourTracker/insert/multiple';
        RequestHandler.post(url, multipleHourTrackers).then((newMultipleHourTrackers) => {
            self.addMultipleHourTrackersSuccess(newMultipleHourTrackers);
        }).catch(() => {
            self.resetData();
        });
    }

    addHourTracker(data, scope, task, updateCallback = null, isFromGrid = false) {
        let self = this;
        let copyOfScope = cloneDeep(scope);
        async.waterfall([
            function (callback) {
                let url = 'hourTracker';
                RequestHandler.post(url, data)
                    .then((hourTracker) => {
                        callback(null, hourTracker);
                    }).catch((err) => {
                        callback(err);
                    });
            },
            function (hourTracker, callback) {
                if (scope && task) {
                    let url = 'scope/hourtracker/' + scope._id;
                    RequestHandler.put(url, hourTracker).then((updatedScope) => {
                        callback(null, { scope: updatedScope, hourTracker });
                    }).catch((err) => {
                        callback(err);
                    });
                } else {
                    callback(null, hourTracker);
                }
            }
        ], (err, result) => {
            if (!err) {
                if (scope && task) {
                    result.hourTracker.scope = result.scope;
                    result.hourTracker.task = result.scope.task;
                    self.addHourTrackerSuccess(result.hourTracker);
                    if (updateCallback !== null) {
                        updateCallback(result.hourTracker);
                    }
                    TaskAction.addHourTrackerInScope(result);
                } else {
                    self.addHourTrackerSuccess(result);
                    if (updateCallback !== null) {
                        updateCallback(result);
                    }
                }
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    searchTask(query) {
        let self = this;
        let url = 'tasks/tasks-for-timesheet/' + query;

        RequestHandler.get(url).then((searchedTask) => {
            self.searchTaskSuccess(searchedTask);
        }).catch((err) => {
            self.resetData();
        });
    }

    searchScopesOfTask(taskID) {
        let self = this;
        let url = 'scope/scopes/of/task/' + taskID;

        RequestHandler.get(url).then((searchedScopes) => {
            self.searchScopesSuccess(searchedScopes);
        }).catch(() => {
            self.resetData();
        });
    }

    // getUserScopes(userId) {
    //     let self = this;
    //     let url = 'scope/user/' + userId;

    //     RequestHandler.get(url).then((userScopes) => {
    //         self.getUserScopesSuccess(userScopes);
    //     }).catch(() => {
    //         self.resetData();
    //     });
    // }

    getUserTasks(userId, keyword) {
        let self = this;
        let url = 'tasks/user/task_scope';
        RequestHandler.post(url, { userId, keyword }).then((userTask) => {
            self.getUserTasksSuccess(userTask);
        }).catch((e) => {
            console.log(e);
            self.resetData();
        });
    }
}

export default alt.createActions(UserAction);
