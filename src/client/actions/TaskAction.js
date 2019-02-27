import async from 'async';
import indexOf from 'lodash/indexOf';
import forEach from 'lodash/forEach';
import remove from 'lodash/remove';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import find from 'lodash/find';
import cookie from 'react-cookie';

import alt from '../alt.js';
import Constant from '../components/helpers/Constant.js';

import RequestHandler from '../components/helpers/RequestHandler.js';

import AppAction from './AppAction.js';
import ReportAction from './ReportAction.js';

import ReportStore from '../stores/ReportStore.js';
import { getTaskNumber } from '../utils/common.js';
import LoginAction from './LoginAction.js';
import LoginStore from '../stores/LoginStore.js';

class TaskAction {
    constructor() {
        this.generateActions(
            'clearStore',
            'scopesSortBy',
            'updateScopeSuccess',
            'setDropableTaskGroup',
            'updateScopeBySocketSuccess',
            'updateMultipleScopeBySocketSuccess',
            'closeTaskModal',
            'setGetBillingReportSuccess',
            'addScopeAndPrice',
            'deleteScopeAndPrice',
            'viewMyScopes',
            'setDeleteMode',
            'tasksSortBy',
            'setLoaderText',
            'setTemplate',
            'toggleSubTaskModal',
            'setSelectedSubTask',
            'changeTaskGroupView',
            'getEngineeringHours',
            'updateMileStoneBySocketSuccess',
            'getDraftingHours',
            'updateEngineeringHours',
            'updateDraftingHours',
            'addTaskMemberSuccess',
            'addTaskBySocketSuccess',
            'updateProgressBar',
            'changeCommentText',
            'editComment',
            'closeEditComment',
            'editHourTrackerSuccess',
            'updateTaskBySocketSuccess',
            'hourTrackerAction',
            'toggleHourTrackerModal',
            'addLoader',
            'attachTaskFileSuccess',
            'attachTaskFileFail',
            'updateScopeTemplateBySocketSuccess',
            'setNewTagNameError',
            'toggleAddAttachment',
            'updateTaskSuccess',
            'setError',
            'resetError',
            'setDuplicateProjectTaskData',
            'resetDuplicateProjectName',
            'addTaskGroupSuccess',
            'deleteTaskGroupSuccess',
            'getTaskSuccess',
            'addTaskSuccess',
            'getTaskGroupsSuccess',
            'resetData',
            'toggleTaskGroupModal',
            'isViewTask',
            'initialSetupSuccess',
            'openTaskModal',
            'addNewTaskName',
            'selectTask',
            'toggleFetchingContractors',
            'toggleFetchingContacts',
            'getOffice365ContractorsSuccess',
            'getOffice365ContactsSuccess',
            'selectScope',
            'toggleTagLoading',
            'toggleStepStatusSuccess',
            'updateSelectedDocument',
            'addNewTaskGroupName',
            'changeScopeNote',
            'changeTaskTitle',
            'changeTaskCity',
            'changeTaskState',
            'changeScopePrice',
            'changeUrgentHour',
            'handleSelectedScopesCheck',
            'handleInvoiceEdit',
            'handleInvoiceDataUpdate',
            'changeNonUrgentHour',
            'updateEngineerDrafterSuccess',
            'toggleScopeStepStatusSuccess',
            'changeHoursSpent',
            'updateHourTrackerBySocketSuccess',
            'archiveSuccess',
            'restoreSuccess',
            'archiveScopeTemplateSuccess',
            'restoreScopeTemplateSuccess',
            'getArchivedDataSuccess',
            'setViewArchivedScopesModal',
            'handleAddDocument',
            'handleUpdateDocument',
            'closeDocumentModel',
            'closeDocumentView',
            'showDocumentView',
            'toggleSocketReceived',
            'updateLoggedInUser',
            'setViewArchivedMileStonesModal',
            'restoreData',
            'changeDefinition',
            'changeScopeItemType',
            'changeScopeGroup',
            'changeDueDate',
            'disableAttachfiles',
            'changeCustomerContact',
            'changeEngineer',
            'changeStatus',
            'changeDrafter',
            'changeFormScopeNote',
            'changeFormScopePrice',
            'getMaxTaskNumberSuccess',
            'changeFormUrgentHour',
            'changeFormNonUrgentHour',
            'getScopesSuccess',
            'getArchivedScopesOfTask',
            'setChangeTaskGroup',
            'showSocketNotification',
            'sortInvoices',
            'showUserTasks',
            'getActiveScopesSuccess',
            'getHoldScopesSuccess',
            'getTasksScopesSuccess',
            'getBidsScopesSuccess',
            'getCompletedScopesSuccess',
            'getScopeInvoicePageScopesSuccess',
            'getGroupScopes',
            'updateManagerSuccess',
            'openSelectedtask',
            'updateManagerBySocketSuccess',
            'clearSelectedUser',
            'resetCompletedScopes',
            'getAccordionStatusSuccess',
            'setAccordionStatusSuccess',
            'manualSortScopes',
            'toggleManualSorting',
            'removeLoader',
            'changeRevNumber',
            'changeInputValueInScopeTeam',
            'changeInputValueInScopeInvoices',
            'addScopeInvoice',
            'updateMilestoneSuccess',
            'toggleConfirmAddRevScope',
            'setParentForRevScope',
            'addRevScopeSuccess',
            'addRevScopeBySocketSuccess',
            'clearSocketToastrMode',
            'syncContractorSuccess',
            'changeSyncContractState',
            'resetUpdateReportFlag',
            'updateActiveGridScope',
            'clearFechingTask',
            'showConfirmationPupup',
            'clearConfirmationPupupData',
            'toggleAddHourTrackerModal',
            'setHourTrackerData',
            'addHourTrackerInScope',
            'showCongratulationsPopup',
            'closeCongratulationsPopup',
            'updateHourTrackerForGridScope',
            'updateHourTrackerByGroupId',
            'deleteHourTrackerInScope'
        );
    }

    createFolder(path, folderName, callback) {
        let url = 'ftp/folder';
        let folder = {
            path: path,
            folderName: folderName
        };
        RequestHandler.post(url, folder).then((data) => {
            callback(null, data);
        }).catch((error) => {
            callback(error);
        });
    }

    addTaskGroup(title, userId) {
        let self = this;
        let url = 'task-groups';
        let taskGroup = {
            title: title,
            createdBy: userId
        };
        RequestHandler.post(url, taskGroup).then((data) => {
            self.addTaskGroupSuccess(data);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_GROUP.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            self.resetData();
        });
    }

    createScopesInSeriesForNewTask(payload) {
        const self = this;
        let asyncCallBacks = [];
        forEach(payload.allScopes, (scope) => {
            scope.task = payload.newTask._id;
            scope.managerDetails = {
                manager: payload.createdBy,
                urgentHours: 0,
                nonUrgentHours: 0
            };
            asyncCallBacks.push(
                function (callback) {
                    let url = 'drawing';
                    let drawing = {
                        number: 0,
                        templates: Constant.DRAWING_TEMPLATES
                    };
                    self.setLoaderText(Constant.LOADER_TEXT.ADD_DRAWING);
                    RequestHandler.post(url, drawing).then((savedDrawing) => {
                        url = 'calc';
                        let calc = {
                            number: 0,
                            templates: Constant.CALC_TEMPLATES
                        };
                        self.setLoaderText(Constant.LOADER_TEXT.ADD_CALC);
                        RequestHandler.post(url, calc).then((savedCalc) => {
                            url = 'scope';
                            if (!scope.drawings) {
                                scope.drawings = [];
                            }
                            scope.drawings.push(savedDrawing._id);
                            if (!scope.calcs) {
                                scope.calcs = [];
                            }
                            scope.calcs.push(savedCalc._id);
                            self.setLoaderText(Constant.LOADER_TEXT.CREATE_SCOPE);
                            RequestHandler.post(url, { scope: scope, taskID: payload.newTask.id }).then((savedScope) => {
                                callback(null, savedScope);
                            }).catch((error) => {
                                callback(error);
                            });
                        }).catch((error) => {
                            callback(error);
                        });
                    }).catch((error) => {
                        callback(error);
                    });
                }
            );
        });
        return new Promise((resolve, reject) => {
            async.series(asyncCallBacks, function (scopeError, allScopes) {
                if (scopeError) {
                    reject(scopeError);
                } else {
                    resolve(allScopes);
                }
            });
        });
    }

    createScopesInSeriesForExistingTask(updatingTask, scopesToUpdated) {
        const self = this;
        let asyncCallBacks = [];
        let task = updatingTask;
        let scopeIds = [];
        let taskNumber = getTaskNumber(task);
        let contractorName = task.contractor.company ? task.contractor.company.trim() : task.contractor.name;
        forEach(task.scopes, (scope) => {
            if (scope._id) {
                if (scopesToUpdated.includes(scope.id)) {
                    asyncCallBacks.push(
                        function (callback) {
                            self.setLoaderText(Constant.LOADER_TEXT.UPDATE_SCOPE);
                            let url = 'scope/' + scope.id;
                            RequestHandler.put(url, scope).then((updatedScope) => {
                                scopeIds.push(updatedScope._id);
                                callback(null, updatedScope._id);
                            }).catch((err) => {
                                callback(err);
                            });
                        }
                    );
                }
            } else {
                asyncCallBacks.push(
                    function (callback) {
                        let url = 'drawing';
                        let drawing = {
                            number: 0,
                            templates: Constant.DRAWING_TEMPLATES
                        };
                        scope.task = task._id;
                        scope.managerDetails = {
                            manager: task.createdBy,
                            urgentHours: 0,
                            nonUrgentHours: 0
                        };
                        self.setLoaderText(Constant.LOADER_TEXT.ADD_DRAWING);
                        RequestHandler.post(url, drawing).then((savedDrawing) => {
                            url = 'calc';
                            let calc = {
                                number: 0,
                                templates: Constant.CALC_TEMPLATES
                            };
                            self.setLoaderText(Constant.LOADER_TEXT.ADD_CALC);
                            RequestHandler.post(url, calc).then((savedCalc) => {
                                url = 'scope/addscope';
                                if (!scope.drawings) {
                                    scope.drawings = [];
                                }
                                scope.drawings.push(savedDrawing._id);
                                if (!scope.calcs) {
                                    scope.calcs = [];
                                }
                                scope.calcs.push(savedCalc._id);
                                self.setLoaderText(Constant.LOADER_TEXT.CREATE_SCOPE);
                                RequestHandler.post(url, { scope: scope, taskID: task.id }).then((savedScope) => {
                                    scopeIds.push(savedScope._id);
                                    callback(null, savedScope._id);
                                }).catch((error) => {
                                    callback(error);
                                });
                            }).catch((error) => {
                                callback(error);
                            });
                        }).catch((error) => {
                            callback(error);
                        });
                    }
                );
            }
        });
        return new Promise((resolve, reject) => {
            async.series(asyncCallBacks, function (scopeError, allScopeIds) {
                if (scopeError) {
                    reject(scopeError);
                } else {
                    resolve(allScopeIds);
                }
            });
        });
    }

    addRevScope(parentScopeOld, scopeIds, updatingTaskID, loggedInUserId, { managerID, drafterID, engineerID, group }) {
        const self = this;
        const url = 'scope/addRevScope';
        let parentScope = cloneDeep(parentScopeOld);
        if (group.id === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
            group.id = Constant.TASK_GROUP_ID.ACTIVE_PROJECTS;
            group._id = Constant.TASK_GROUP__ID.ACTIVE_PROJECTS;
            group.title = 'Active Projects';
        }
        parentScope.group = group;
        const data = {
            parentScope,
            updatingTaskID,
            scopeIds,
            loggedInUserId,
            managerID,
            drafterID,
            engineerID

        };
        RequestHandler.post(url, data).then((savedRevScope) => {
            self.addRevScopeSuccess(savedRevScope);
        }).catch(() => {
            self.resetData();
        });
    }

    addTask(task) {
        let self = this;
        let allScopes = cloneDeep(task.scopes);
        task.scopes = [];
        async.waterfall([
            function (callback) {
                let url = 'tasks';
                delete task.invoices;
                delete task.purchaseOrders;
                delete task.agreements;
                delete task.attachments;
                self.setLoaderText(Constant.LOADER_TEXT.CREATE_TASK);
                RequestHandler.post(url, task).then((newTask) => {
                    callback(null, newTask);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (newTask, callback) {
                let payload = {
                    allScopes,
                    newTask,
                    createdBy: newTask.createdBy
                };
                self.createScopesInSeriesForNewTask(payload).then((createdScopes) => {
                    newTask.scopes = createdScopes;
                    callback(null, newTask);
                }).catch((errors) => {
                    callback(errors);
                });
            },
            function (newTask, callback) {
                if (newTask.isFromTaskGroup) {
                    callback(null, newTask);
                } else {
                    let url = 'purchaseOrder';
                    let data = {
                        number: 1,
                        templates: Constant.PURCAHSE_ORDER_TEMPLATES
                    };
                    self.setLoaderText(Constant.LOADER_TEXT.ADD_PO);
                    RequestHandler.post(url, data).then((po) => {
                        if (!newTask.purchaseOrders) {
                            newTask.purchaseOrders = [];
                        }
                        newTask.purchaseOrders.push(po._id);
                        callback(null, newTask);
                    }).catch((err) => {
                        callback(err);
                    });
                }
            },
            function (newTask, callback) {
                if (newTask.isFromTaskGroup) {
                    callback(null, newTask);
                } else {
                    switch (newTask.contractor.contract.toLowerCase()) {
                    case 'ma':
                        let MATemplate = cloneDeep(Constant.MASTER_AGREEMENT_TEMPLATES);
                        MATemplate[0].isDone = true;
                        MATemplate[1].isDone = true;
                        let maUrl = 'masterAgreement';
                        let masterAgreement = {
                            number: 1,
                            templates: MATemplate,
                            selectedScopes: newTask.scopes
                        };
                        self.setLoaderText(Constant.LOADER_TEXT.ADD_CSA);
                        RequestHandler.post(maUrl, masterAgreement).then((ma) => {
                            if (!newTask.masterAgreements) {
                                newTask.masterAgreements = [];
                            }
                            newTask.masterAgreements.push(ma._id);
                            callback(null, newTask);
                        }).catch((err) => {
                            callback(err);
                        });
                        break;

                    case 'ca':
                        let caUrl = 'clientAgreement';
                        let caData = {
                            number: 1,
                            templates: Constant.CLIENT_AGREEMENT_TEMPLATES,
                            selectedScopes: newTask.scopes
                        };
                        self.setLoaderText(Constant.LOADER_TEXT.ADD_CSA);
                        RequestHandler.post(caUrl, caData).then((ca) => {
                            if (!newTask.clientAgreements) {
                                newTask.clientAgreements = [];
                            }
                            newTask.clientAgreements.push(ca._id);
                            callback(null, newTask);
                        }).catch((err) => {
                            callback(err);
                        });
                        break;

                    case 'mca':
                    case 'mcsa':
                        let mcaUrl = 'modifiedAgreement';
                        let mcaData = {
                            number: 1,
                            templates: Constant.MODIFIED_CUSTOMER_SERVICE_AGREEMENT_TEMPLATES,
                            selectedScopes: newTask.scopes
                        };
                        self.setLoaderText(Constant.LOADER_TEXT.ADD_CSA);
                        RequestHandler.post(mcaUrl, mcaData).then((mca) => {
                            if (!newTask.modifiedAgreements) {
                                newTask.modifiedAgreements = [];
                            }
                            newTask.modifiedAgreements.push(mca._id);
                            callback(null, newTask);
                        }).catch((err) => {
                            callback(err);
                        });
                        break;

                    case 'csa':
                        let url = 'agreement';
                        let contract = Constant.CUSTOMER_SERVICE_AGREEMENT_TEMPLATES;
                        let csaData = {
                            number: 1,
                            templates: contract,
                            selectedScopes: newTask.scopes
                        };
                        self.setLoaderText(Constant.LOADER_TEXT.ADD_CSA);
                        RequestHandler.post(url, csaData).then((csa) => {
                            if (!newTask.agreements) {
                                newTask.agreements = [];
                            }
                            newTask.agreements.push(csa._id);
                            callback(null, newTask);
                        }).catch((err) => {
                            callback(err);
                        });
                        break;

                    default:
                        callback(null, newTask);
                        break;
                    }
                }
            },
            function (newTask, callback) {
                let contract = '';
                switch (newTask.contractor.contract.toLowerCase()) {
                case 'ma':
                    contract = 'masterAgreement';
                    break;
                case 'ca':
                    contract = 'clientAgreement';
                    break;
                case 'mca':
                case 'mcsa':
                    contract = 'modifiedAgreement';
                    break;
                case 'csa':
                    contract = 'agreement';
                    break;
                }
                if (contract.length > 0) {
                    let url = 'counter/update-counter';
                    let data = {
                        taskID: newTask.id,
                        contract
                    };
                    self.setLoaderText(Constant.LOADER_TEXT.ADD_INVOICE);
                    RequestHandler.post(url, data).then((agreementNo) => {
                        callback(null, newTask);
                    }).catch((err) => {
                        callback(err);
                    });
                } else {
                    callback(null, newTask);
                }
            },
            function (newTask, callback) {
                if (newTask.isFromTaskGroup) {
                    callback(null, newTask);
                } else {
                    let selectedScopes = newTask.scopes.map(scope => {
                        return {
                            scope,
                            oldPrice: scope.price,
                            description: scope.definition
                        };
                    });
                    let url = 'invoice';
                    let data = {
                        number: 1,
                        templates: Constant.INVOICE_TEMPLATES,
                        lastModifiedBy: newTask.createdBy,
                        selectedScopes
                    };
                    self.setLoaderText(Constant.LOADER_TEXT.ADD_INVOICE);
                    RequestHandler.post(url, data).then((invoice) => {
                        if (!newTask.invoices) {
                            newTask.invoices = [];
                        }
                        newTask.invoices.push(invoice._id);
                        callback(null, newTask);
                    }).catch((err) => {
                        callback(err);
                    });
                }
            },
            function (newTask, callback) {
                let url = 'tasks/' + newTask.id;
                self.setLoaderText(Constant.LOADER_TEXT.UPDATE_TASK);
                RequestHandler.put(url, newTask).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, data) {
            if (!err) {
                self.addTaskSuccess(data);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
                if (!data.isFromTaskGroup) {
                    let url = 'ftp/initialSetup';
                    self.addLoader('initialSetup');
                    self.setLoaderText(Constant.LOADER_TEXT.SET_UP_FTP);
                    RequestHandler.post(url, data).then(() => {
                        self.initialSetupSuccess();
                    }).catch(() => {
                        self.resetData();
                    });
                }
                LoginAction.getTotalHours(LoginStore.getState().user._id);
            } else {
                self.resetData();
            }
        });
    }

    attachTaskFile(user, files, attachment, task) {
        let self = this;
        let path;
        async.waterfall([
            function (callback) {
                let taskAttachment = find(task.attachments, { attachmentId: attachment._id });
                let attachmentExist = find(taskAttachment.files, (file) => {
                    return file.name === files[0].name;
                });
                if (attachmentExist) {
                    AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK.ATTACHMENTS.EXIST, level: Constant.NOTIFICATION_LEVELS.ERROR });
                    callback(attachmentExist);
                }
                callback(null, taskAttachment);
            },
            function (taskAttachment, callback) {
                let taskYear = new Date(task.createdAt).getFullYear().toString();
                let taskNumber = task.isBidding ? 'B' + taskYear.substr(2, 2) + '-' + task.taskNumber :
                    taskYear.substr(2, 2) + '-' + task.taskNumber;
                let contractorName = task.contractor.company ? task.contractor.company.trim() : task.contractor.name;
                path = contractorName + '/' + taskYear + '/' + task.city + ', ' + task.state + ' - ' + task.title + ' - ' +
                    taskNumber + '/' + attachment.name;

                let dest = path + '/' + files[0].name;
                let url = 'ftp/file/upload';
                let data = new FormData();
                data.append('dest', dest);
                data.append('file', files[0]);

                RequestHandler.put(url, data).then(() => {
                    if (!taskAttachment.files) {
                        taskAttachment.files = [];
                    }
                    taskAttachment.files.push({ name: files[0].name });
                    callback(null, taskAttachment);
                }).catch((err) => {
                    callback(err);
                });
                self.updateProgressBar({ completed: 70, attachmentId: attachment._id });
            },
            function (taskAttachment, callback) {
                let attachmentTask = {
                    attachments: task.attachments
                };
                let url = 'tasks/' + task.id;
                RequestHandler.put(url, attachmentTask).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((error) => {
                    callback(error);
                });
                self.updateProgressBar({ completed: 95, attachmentId: attachment._id });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.attachTaskFileSuccess({ task: updatedTask, attachment: attachment });
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_FILE.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.attachTaskFileFail(attachment);
            }
        });
    }

    deleteAttachedFile(filePath, fileId, attachmentId, task) {
        let self = this;
        async.waterfall([
            function (callback) {
                let data = {
                    filePath
                };
                let url = 'ftp/delete';
                RequestHandler.post(url, data).then(() => {
                    callback(null);
                }).catch((error) => {
                    callback(error);
                });
            },
            function (callback) {
                let url = 'tasks/' + task.id;
                let attachment = find(task.attachments, { attachmentId: attachmentId });
                let fileIndex = indexOf(attachment.files, find(attachment.files, { _id: fileId }));
                attachment.files.splice(fileIndex, 1);
                let index = indexOf(task.attachments, attachment);
                task.attachments.splice(index, 1, attachment);
                let attachmentTask = {
                    attachments: task.attachments,
                    id: task.id
                };
                RequestHandler.put(url, attachmentTask).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((error) => {
                    callback(error);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_FILE.DELETE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    updateTaskForGroupChange(task, notificationMsg) {
        let url = 'tasks/change/group/' + task._id;

        RequestHandler.put(url, task).then((updatedTask) => {
            this.updateTaskSuccess(updatedTask);
            AppAction.showNotification({ message: notificationMsg, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            LoginAction.getTotalHours(LoginStore.getState().user._id);
        }).catch(() => {
            this.resetData();
        });
    }

    updateTask(task, notificationMsg) {
        let url = 'tasks/' + task.id;

        RequestHandler.put(url, task).then((updatedTask) => {
            this.updateTaskSuccess(updatedTask);
            AppAction.showNotification({ message: notificationMsg, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            this.resetData();
        });
    }

    updateTaskForm(task, notificationMsg, scopesToUpdated) {
        let self = this;
        let scopes = cloneDeep(task.scopes);
        let taskNumber = getTaskNumber(task);
        let contractorName = task.contractor.company ? task.contractor.company.trim() : task.contractor.name;

        async.waterfall([
            function (callback) {
                self.createScopesInSeriesForExistingTask(task, scopesToUpdated).then(function (scopeIds) {
                    callback(null, scopeIds);
                }).catch(function (scopeError) {
                    callback(scopeError);
                });
            },
            function (scopeIds, callback) {
                let url = 'tasks/addscope/' + task._id;
                let taskData = {
                    additionalNote: task.additionalNote,
                    city: task.city,
                    state: task.state,
                    title: task.title,
                    contractor: task.contractor
                };

                let data = {
                    taskData: taskData,
                    scopeIds: scopeIds
                };

                self.setLoaderText(Constant.LOADER_TEXT.UPDATE_TASK);

                RequestHandler.put(url, data).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((err) => {
                    console.log(err);
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: notificationMsg, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
                if (!updatedTask.isFromTaskGroup) {
                    taskNumber = getTaskNumber(updatedTask);
                    forEach(scopes, (scope) => {
                        if (scope.scopeNoteData && scope.scopeNoteData.oldNote.toLowerCase() !== scope.scopeNoteData.newNote.toLowerCase()) {
                            let oldCalcPath = contractorName + '/' + new Date(updatedTask.createdAt).getFullYear().toString() + '/' +
                                updatedTask.city + ', ' + updatedTask.state + ' - ' + updatedTask.title + ' - ' + taskNumber +
                                '/DHC Calcs/' + 'Scope ' + scope.number + ' - ' + scope.scopeNoteData.oldNote;
                            let newCalcPath = contractorName + '/' + new Date(updatedTask.createdAt).getFullYear().toString() + '/' +
                                updatedTask.city + ', ' + updatedTask.state + ' - ' + updatedTask.title + ' - ' + taskNumber +
                                '/DHC Calcs/' + 'Scope ' + scope.number + ' - ' + scope.scopeNoteData.newNote;
                            // self.renameFTPFolder(oldCalcPath, newCalcPath);

                            let oldDrawingPath = contractorName + '/' + new Date(updatedTask.createdAt).getFullYear().toString() + '/' +
                                updatedTask.city + ', ' + updatedTask.state + ' - ' + updatedTask.title + ' - ' + taskNumber +
                                '/DHC Drawings/' + 'Scope ' + scope.number + ' - ' + scope.scopeNoteData.oldNote;
                            let newDrawingPath = contractorName + '/' + new Date(updatedTask.createdAt).getFullYear().toString() + '/' +
                                updatedTask.city + ', ' + updatedTask.state + ' - ' + updatedTask.title + ' - ' + taskNumber +
                                '/DHC Drawings/' + 'Scope ' + scope.number + ' - ' + scope.scopeNoteData.newNote;
                            // self.renameFTPFolder(oldDrawingPath, newDrawingPath);
                        }
                    });
                }
                LoginAction.getTotalHours(LoginStore.getState().user._id);
            } else {
                self.resetData();
            }
        });
    }

    addTaskMember(task, taskToUpdate, user) {
        let self = this;
        async.waterfall([
            function (callback) {
                if (cookie.load(Constant.COOKIES.SLACK_ACCESS_TOKEN) && task.slackChannelId && user.slackId) {
                    let url = 'slack/invite/channel/' + task.slackChannelId + '/' + user.slackId;

                    RequestHandler.get(url).then(() => {
                        callback(null);
                    }).catch(() => {
                        callback(null);
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                let url = 'tasks/' + taskToUpdate.id;
                RequestHandler.put(url, taskToUpdate).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((error) => {
                    callback(error);
                });
            }
        ], (err, data) => {
            if (!err) {
                self.updateTaskSuccess(data);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_MEMBER.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    removeTaskMember(task, taskToUpdate, teamMember, workingHour) {
        let self = this;
        async.waterfall([
            function (callback) {
                if (cookie.load(Constant.COOKIES.SLACK_ACCESS_TOKEN) && task.slackChannelId && teamMember.slackId) {
                    let url = 'slack/kick/channel/' + task.slackChannelId + '/' + teamMember.slackId;

                    RequestHandler.get(url).then(() => {
                        callback(null);
                    }).catch(() => {
                        callback(null);
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                if (workingHour) {
                    let url = 'workingHours/' + workingHour.id;
                    RequestHandler.delete(url).then(() => {
                        callback(null);
                    }).catch((error) => {
                        callback(error);
                    });
                } else {
                    callback(null);
                }
            },
            function (callback) {
                let url = 'tasks/' + taskToUpdate.id;
                RequestHandler.put(url, taskToUpdate).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((error) => {
                    callback(error);
                });
            }
        ], (err, data) => {
            if (!err) {
                self.updateTaskSuccess(data);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_MEMBER.DELETE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    getTaskGroups() {
        let url = 'task-groups';
        let self = this;
        RequestHandler.get(url).then((data) => {
            self.getTaskGroupsSuccess(data);
        }).catch(() => {
            self.resetData();
        });
    }

    // getTasks() {
    //     let url = 'tasks';
    //     let self = this;
    //     RequestHandler.get(url).then((data) => {
    //         self.getTaskSuccess(data);
    //     }).catch(() => {
    //         self.resetData();
    //     });
    // }

    getScopes() {
        let self = this;
        let url = 'scope';
        RequestHandler.get(url).then((data) => {
            self.getScopesSuccess(data);
        }).catch(() => {
            self.resetData();
        });
    }

    addHourTracker(data, scope) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'hourTracker';

                RequestHandler.post(url, data).then((hourTracker) => {
                    callback(null, hourTracker);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (hourTracker, callback) {
                let url = 'scope/hourtracker/' + scope._id;

                RequestHandler.put(url, hourTracker).then((updatedScope) => {
                    callback(null, updatedScope);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], (err, updatedScope) => {
            if (!err) {
                ReportAction.getReport(ReportStore.getState().filters);
                self.updateScopeSuccess(updatedScope);
                self.removeLoader('hourTracker');
                // AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    editHourTracker(data, newScope, oldScope) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'hourTracker/' + data.id;
                self.setLoaderText();
                RequestHandler.put(url, data).then((updatedHourTracker) => {
                    callback(null, updatedHourTracker);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (hourTracker, callback) {
                if (oldScope.id !== newScope.id) {
                    let url = 'scope/' + oldScope.id;
                    let data = {
                        hourTrackers: oldScope.hourTrackers
                    };

                    remove(data.hourTrackers, (hourTrackerToRemove) => {
                        return hourTrackerToRemove._id === hourTracker._id;
                    });
                    self.setLoaderText(Constant.LOADER_TEXT.UPDATE_SCOPE);
                    RequestHandler.put(url, data).then((updatedOldScope) => {
                        url = 'scope/' + newScope.id;
                        data = {
                            hourTrackers: newScope.hourTrackers
                        };

                        data.hourTrackers.push(hourTracker._id);

                        RequestHandler.put(url, data).then((updatedNewScope) => {
                            callback(null, {
                                oldScope: updatedOldScope,
                                newScope: updatedNewScope
                            });
                        }).catch((err) => {
                            callback(err);
                        });
                    }).catch((err) => {
                        callback(err);
                    });
                } else {
                    let hourTrackerToUpdate = find(oldScope.hourTrackers, { id: hourTracker.id });
                    merge(hourTrackerToUpdate, hourTracker);
                    let index = indexOf(oldScope.hourTrackers, find(oldScope.hourTrackers, { id: hourTrackerToUpdate.id }));
                    oldScope.hourTrackers.splice(index, 1, hourTrackerToUpdate);

                    callback(null, {
                        oldScope: oldScope,
                        newScope: null
                    });
                }
            }
        ], (err, updatedScopePayload) => {
            if (!err) {
                self.editHourTrackerSuccess(updatedScopePayload);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    deleteHourTracker(hourTracker, scope) {
        let self = this;
        async.waterfall([
            function (callback) {
                let url = 'hourTracker/' + hourTracker._id;
                RequestHandler.delete(url).then(() => {
                    callback(null);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (callback) {
                let index = indexOf(scope.hourTrackers, find(scope.hourTrackers, {
                    id: hourTracker.id
                }));

                scope.hourTrackers.splice(index, 1);

                let url = 'scope/get-single-scope/' + scope.id;
                RequestHandler.get(url).then((updatedScope) => {
                    callback(null, updatedScope);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedScope) {
            if (!err) {
                ReportAction.getReport(ReportStore.getState().filters);
                self.updateScopeSuccess(updatedScope);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.DELETE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    getOffice365Contractors(query, generalizeCompanyName = false) {
        let url = 'office/contractors/' + query;
        let self = this;

        RequestHandler.get(url).then((contractors) => {
            self.getOffice365ContractorsSuccess({ contractors, generalizeCompanyName });
        }).catch((e) => {
            console.log('error', e);
            self.resetData();
        });
    }

    getOffice365Contacts(query) {
        let url = 'office/contacts/' + query;
        let self = this;

        RequestHandler.get(url).then((contacts) => {
            self.getOffice365ContactsSuccess(contacts);
        }).catch(() => {
            self.resetData();
        });
    }

    /**
     *
     * @param {Array Scope Object} scopeArray
     * @param {Notification Message String} notification
     * accept Array of scope object and notification message string
     */
    updateMultipleScope(scopeArray, notification) {
        let self = this;
        let url = 'scope/update-multiple-scopes';
        RequestHandler.put(url, scopeArray).then((updateScopeArray) => {
            updateScopeArray.map(scope => {
                ReportAction.getReport(ReportStore.getState().filters);
                self.updateScopeSuccess(scope);
            });
            AppAction.showNotification({ message: notification, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            self.resetData();
        });
    }

    updateScope(scope, notificationMsg, isMovingToAnothorGroup = false, updateTotalUrgentHours = null) {
        let url = 'scope/' + scope.id;
        let self = this;
        RequestHandler.put(url, scope).then((updatedScope) => {
            ReportAction.getReport(ReportStore.getState().filters);
            if (isMovingToAnothorGroup && updatedScope.price >= 7500 && updatedScope.group.id === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
                self.showCongratulationsPopup(updatedScope);
            }
            if (updateTotalUrgentHours) {
                updateTotalUrgentHours(updatedScope);
            }
            self.updateScopeSuccess(updatedScope);
            AppAction.showNotification({ message: notificationMsg, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch((e) => {
            console.log(e);
            self.resetData();
        });
    }

    toggleStepStatus(objectType, object, data) {
        let self = this;
        let url = '';
        switch (objectType) {
        case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
            url = 'purchaseOrder/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
            url = 'agreement/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
            url = 'modifiedAgreement/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
            url = 'masterAgreement/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
            url = 'clientAgreement/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.INVOICE:
            url = 'invoice/' + object.id;
            break;
        default:
        }

        RequestHandler.put(url, data).then((updatedObject) => {
            self.toggleStepStatusSuccess({
                object: updatedObject,
                objectType: objectType
            });
        }).catch(() => {
            self.resetData();
        });
    }

    toggleScopeStepStatus(scope, objectType, object, data) {
        let self = this;
        let url;

        switch (objectType) {
        case Constant.DOCUMENT_TYPES.DRAWING:
            url = 'drawing/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.CUST_DRAWING:
            url = 'custDrawing/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.CALC:
            url = 'calc/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.LETTER:
            url = 'letter/' + object.id;
            break;
        case Constant.DOCUMENT_TYPES.TAB_DATA:
            url = 'tabData/' + object.id;
            break;
        default:
        }

        RequestHandler.put(url, data).then((updatedObject) => {
            self.toggleScopeStepStatusSuccess({
                object: updatedObject,
                objectType: objectType,
                scope: scope
            });
        }).catch(() => {
            self.resetData();
        });
    }

    deleteScopeTemplate(object, objectType, scope, message) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url;
                if (objectType === Constant.DOCUMENT_TYPES.DRAWING) {
                    url = 'drawing/' + object.id;
                } else if (objectType === Constant.DOCUMENT_TYPES.CALC) {
                    url = 'calc/' + object.id;
                }

                RequestHandler.delete(url).then(() => {
                    callback(null);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (callback) {
                let url = 'scope/' + scope.id;
                RequestHandler.put(url, scope).then((updatedScope) => {
                    callback(null, updatedScope);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedScope) {
            if (!err) {
                ReportAction.getReport(ReportStore.getState().filters);
                self.updateScopeSuccess(updatedScope);
                AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    updateScopeTemplate(object, objectType, scope, message) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url;
                switch (objectType) {
                case Constant.DOCUMENT_TYPES.DRAWING:
                    url = 'drawing/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    url = 'custDrawing/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.CALC:
                    url = 'calc/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    url = 'letter/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    url = 'tabData/' + object.id;
                    break;
                default:
                }

                object.scopeID = scope.id;
                object.taskID = scope.taskID;
                RequestHandler.put(url, object).then((updatedScopeTemplate) => {
                    callback(null, updatedScopeTemplate);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedScopeTemplate) {
            if (!err) {
                if (updatedScopeTemplate.isArchived) {
                    self.archiveScopeTemplateSuccess({
                        object: updatedScopeTemplate,
                        objectType: objectType,
                        scope: scope
                    });
                } else {
                    self.restoreScopeTemplateSuccess({
                        object: updatedScopeTemplate,
                        objectType: objectType,
                        scope: scope
                    });
                }
                AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    deleteMiletstone(object, objectType, task, message) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url;

                if (objectType === Constant.DOCUMENT_TYPES.PURCHASE_ORDER) {
                    url = 'purchaseOrder/' + object.id;
                } else if (objectType === Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT) {
                    url = 'agreement/' + object.id;
                } else if (objectType === Constant.DOCUMENT_TYPES.INVOICE) {
                    url = 'invoice/' + object.id;
                }

                RequestHandler.delete(url).then(() => {
                    callback(null);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (callback) {
                let url = 'tasks/' + task.id;
                RequestHandler.put(url, task).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    updateMiletstone(object, objectType, message) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url;

                switch (objectType) {
                case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                    url = 'purchaseOrder/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                    url = 'agreement/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                    url = 'modifiedAgreement/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                    url = 'masterAgreement/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                    url = 'clientAgreement/' + object.id;
                    break;
                case Constant.DOCUMENT_TYPES.INVOICE:
                    url = 'invoice/' + object.id;
                    break;
                default:
                }

                RequestHandler.put(url, object).then((updatedMileStone) => {
                    callback(null, updatedMileStone);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedMileStone) {
            if (!err) {
                if (updatedMileStone.isArchived) {
                    self.archiveSuccess({
                        object: updatedMileStone,
                        objectType: objectType
                    });
                } else {
                    self.restoreSuccess({
                        object: updatedMileStone,
                        objectType: objectType
                    });
                }

                AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    addPO(purchaseOrder, task) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'purchaseOrder/addPO';
                purchaseOrder.taskID = task.id;

                RequestHandler.post(url, purchaseOrder).then((savedPurchaseOrder) => {
                    callback(null, savedPurchaseOrder);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedPurchaseOrder, callback) {
                let url = 'tasks/addpo/' + task._id;
                RequestHandler.put(url, savedPurchaseOrder).then((newPO) => {
                    remove(task.purchaseOrders, { isArchived: true });
                    task.purchaseOrders.push(newPO);
                    callback(null, task);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.PURCHASE_ORDER.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    updatePO(purchaseOrder, task) {
        let self = this;
        let url = 'purchaseOrder/' + purchaseOrder.id;
        RequestHandler.put(url, purchaseOrder).then((updatedpurchaseOrder) => {
            self.updateMilestoneSuccess({ document: updatedpurchaseOrder, task, documentType: Constant.DOCUMENT_TYPES.PURCHASE_ORDER });
        }).catch((err) => {
            self.resetData();
        });
    }

    addInvoice(invoice, task) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'invoice/addInvoice';
                invoice.taskID = task.id;
                RequestHandler.post(url, invoice).then((savedInvoice) => {
                    // AdminPageAction.addInvoiceSuccess(savedInvoice);
                    callback(null, savedInvoice);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedInvoice, callback) {
                let url = 'tasks/addinvoice/' + task._id;

                RequestHandler.put(url, savedInvoice).then((newInvoice) => {
                    remove(task.invoices, { isArchived: true });
                    task.invoices.push(newInvoice);
                    task._savedInvoice = {
                        savedInvoice
                    };
                    callback(null, task);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.INVOICE.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    updateInvoice(invoice, task) {
        let self = this;
        let url = 'invoice/' + invoice.id;
        RequestHandler.put(url, invoice).then((updatedinvoice) => {
            self.updateMilestoneSuccess({ document: updatedinvoice, task, documentType: Constant.DOCUMENT_TYPES.INVOICE });
        }).catch((err) => {
            self.resetData();
        });
    }

    addCSA(agreement, task) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'agreement/addcsa';
                agreement.taskID = task.id;

                RequestHandler.post(url, agreement).then((savedCSA) => {
                    callback(null, savedCSA);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedCSA, callback) {
                let url = 'tasks/addcsa/' + task._id;
                RequestHandler.put(url, savedCSA).then((newCSA) => {
                    remove(task.agreements, { isArchived: true });
                    task.agreements.push(newCSA);
                    callback(null, task);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.AGREEMENT.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    addMCSA(modifiedAgreement, task) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'modifiedAgreement/addmcsa';
                modifiedAgreement.taskID = task.id;

                RequestHandler.post(url, modifiedAgreement).then((savedMCSA) => {
                    callback(null, savedMCSA);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedMCSA, callback) {
                let url = 'tasks/addmcsa/' + task._id;
                RequestHandler.put(url, savedMCSA).then((newMCSA) => {
                    remove(task.modifiedAgreements, { isArchived: true });
                    task.modifiedAgreements.push(newMCSA);
                    callback(null, task);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.MODIFIED_AGREEMENT.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    addMA(masterAgreement, task) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'masterAgreement/addma';
                masterAgreement.taskID = task.id;

                RequestHandler.post(url, masterAgreement).then((savedMA) => {
                    callback(null, savedMA);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedMA, callback) {
                let url = 'tasks/addma/' + task._id;
                RequestHandler.put(url, savedMA).then((newMA) => {
                    remove(task.masterAgreements, { isArchived: true });
                    task.masterAgreements.push(newMA);
                    callback(null, task);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.MASTER_AGREEMENT.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    addCA(clientAgreement, task) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'clientAgreement/addca';
                clientAgreement.taskID = task.id;

                RequestHandler.post(url, clientAgreement).then((savedCA) => {
                    callback(null, savedCA);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedCA, callback) {
                let url = 'tasks/addca/' + task._id;
                RequestHandler.put(url, savedCA).then((newCA) => {
                    remove(task.clientAgreements, { isArchived: true });
                    task.clientAgreements.push(newCA);
                    callback(null, task);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedTask) {
            if (!err) {
                self.updateTaskSuccess(updatedTask);
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.CLIENT_AGREEMENT.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    updateCSA(agreement, task) {
        let self = this;
        let url = 'agreement/' + agreement.id;
        RequestHandler.put(url, agreement).then((updatedAgreement) => {
            self.updateMilestoneSuccess({ document: updatedAgreement, task, documentType: Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT });
        }).catch((err) => {
            self.resetData();
        });
    }

    updateMCSA(modifiedAgreement, task) {
        let self = this;
        let url = 'modifiedAgreement/' + modifiedAgreement.id;

        RequestHandler.put(url, modifiedAgreement).then((updatedModifiedAgreement) => {
            self.updateMilestoneSuccess({ document: updatedModifiedAgreement, task, documentType: Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT });
        }).catch((err) => {
            self.resetData();
        });
    }

    updateMA(masterAgreement, task) {
        let self = this;
        let url = 'masterAgreement/' + masterAgreement.id;
        RequestHandler.put(url, masterAgreement).then((updatedMasterAgreement) => {
            self.updateMilestoneSuccess({ document: updatedMasterAgreement, task, documentType: Constant.DOCUMENT_TYPES.MASTER_AGREEMENT });
        }).catch((err) => {
            self.resetData();
        });
    }

    updateCA(clientAgreement, task) {
        let self = this;
        let url = 'clientAgreement/' + clientAgreement.id;
        RequestHandler.put(url, clientAgreement).then((updatedClientAgreement) => {
            self.updateMilestoneSuccess({ document: updatedClientAgreement, task, documentType: Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT });
        }).catch((err) => {
            self.resetData();
        });
    }

    uploadDocument(objectType, object, data, file, path) {
        let self = this;

        let dest = path;
        let url = 'ftp/file/upload';
        let formData = new FormData();
        formData.append('dest', dest);
        formData.append('file', file);

        RequestHandler.put(url, formData).then(() => {
            this.toggleStepStatus(objectType, object, data);
        }).catch(() => {
            self.resetData();
        });
    }

    updateEngineerDrafter(task, scope, message) {
        let self = this;

        async.waterfall([
            function (callback) {
                let url = 'tasks/' + task.id;

                RequestHandler.put(url, task).then((updatedTask) => {
                    callback(null, updatedTask);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (updatedTask, callback) {
                let url = 'scope/' + scope.id;

                RequestHandler.put(url, scope).then((updatedScope) => {
                    callback(null, {
                        task: updatedTask,
                        scope: updatedScope
                    });
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, data) {
            if (!err) {
                self.updateEngineerDrafterSuccess(data);
                AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    // Updated group of scopes which are in given task id. and push to the active group if not archived
    updateBidScopeGroup(taskID, updateTotalUrgentHours = null) {
        const url = 'tasks/update-bid-scope-task/' + taskID;
        RequestHandler.put(url).then(updatedScopes => {
            this.updateActiveGridScope(updatedScopes);
            AppAction.showNotification({
                message: 'Group changed successfully..',
                level: Constant.NOTIFICATION_LEVELS.SUCCESS
            });
            if (updateTotalUrgentHours) {
                updateTotalUrgentHours(updatedScopes);
            }
        }).catch(updateBidScopeTaskError => {
            AppAction.showNotification({
                message: 'Update bid scope group failed.',
                level: Constant.NOTIFICATION_LEVELS.ERROR
            });
        });
    }
    updateManger(task, message) {
        const self = this;
        let url = 'tasks/update/manager/' + task.id;
        RequestHandler.put(url, task).then((updatedTask) => {
            self.updateManagerSuccess(updatedTask);
            AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            self.resetData();
        });
    }

    addMilestone(template, scope, data, message) {
        let self = this;
        let url = '';

        async.waterfall([
            function (callback) {
                switch (template) {
                case Constant.DOCUMENT_TYPES.DRAWING:
                    url = 'drawing';
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    url = 'custDrawing';
                    break;
                case Constant.DOCUMENT_TYPES.CALC:
                    url = 'calc';
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    url = 'letter';
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    url = 'tabData';
                    break;
                default:
                }

                RequestHandler.post(url, data).then((savedData) => {
                    callback(null, savedData);
                }).catch((err) => {
                    callback(err);
                });
            },
            function (savedData, callback) {
                url = 'scope/' + scope.id;
                let scopeToUpdate;

                switch (template) {
                case Constant.DOCUMENT_TYPES.DRAWING:
                    if (!scope.drawings) {
                        scope.drawings = [];
                    }
                    scope.drawings.push(savedData._id);
                    scopeToUpdate = {
                        drawings: scope.drawings
                    };
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    if (!scope.custDrawings) {
                        scope.custDrawings = [];
                    }
                    scope.custDrawings.push(savedData._id);
                    scopeToUpdate = {
                        custDrawings: scope.custDrawings
                    };
                    break;
                case Constant.DOCUMENT_TYPES.CALC:
                    if (!scope.calcs) {
                        scope.calcs = [];
                    }
                    scope.calcs.push(savedData._id);
                    scopeToUpdate = {
                        calcs: scope.calcs
                    };
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    if (!scope.letters) {
                        scope.letters = [];
                    }
                    scope.letters.push(savedData._id);
                    scopeToUpdate = {
                        letters: scope.letters
                    };
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    if (!scope.tabData) {
                        scope.tabData = [];
                    }
                    scope.tabData.push(savedData._id);
                    scopeToUpdate = {
                        tabData: scope.tabData
                    };
                    break;
                default:
                }

                RequestHandler.put(url, scopeToUpdate).then((updatedScope) => {
                    callback(null, updatedScope);
                }).catch((err) => {
                    callback(err);
                });
            }
        ], function (err, updatedScope) {
            if (!err) {
                self.updateScopeSuccess(updatedScope);
                AppAction.showNotification({ message: message, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            } else {
                self.resetData();
            }
        });
    }

    getTask(taskId) {
        let url = 'tasks/' + taskId;
        let self = this;
        // self.setLoaderText(Constant.LOADER_TEXT.LOAD_TASK);
        RequestHandler.get(url).then((data) => {
            // self.getArchivedDataSuccess(data);
            self.selectTask({ value: true, task: data });
        }).catch((e) => {
            console.log('error', e);
            self.resetData();
        });
    }

    renameFTPFolder(oldPath, newPath) {
        let url = 'ftp/rename';
        let data = {
            oldPath,
            newPath
        };
        RequestHandler.post(url, data);
    }

    getMaxTaskNumber(resolve, reject) {
        let self = this;
        let url = 'tasks/maxTaskNumber';
        RequestHandler.put(url).then((data) => {
            let payload = {
                taskNumber: data,
                resolve: resolve
            };
            self.getMaxTaskNumberSuccess(payload);
        }).catch((err) => {
            reject(err);
            self.resetData();
        });
    }

    getUsersScopes(userId) {
        this.getUsersActiveScopes(userId);
        this.getUsersHoldScopes(userId);
        this.getUsersTaskScopes(userId);
        this.getUsersBidScopes(userId);
    }

    getHomePageScopes(userId) {
        let url = 'scope/users/scopes';
        const activeScopeHeader = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.ACTIVE_PROJECTS
        };
        const holdScopeHeader = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.ON_HOLD
        };
        const taskScopeHeader = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.TASKS
        };
        const bidScopeHeader = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.BIDS
        };
        async.parallel([
            (callback) => {
                RequestHandler.post(url, activeScopeHeader).then((data) => {
                    AppAction.showNotification({
                        message: 'Active scopes arrived.',
                        level: Constant.NOTIFICATION_LEVELS.SUCCESS
                    });
                    callback(null, data);
                }).catch(e => {
                    callback(e);
                });
            },
            (callback) => {
                RequestHandler.post(url, holdScopeHeader).then((data) => {
                    AppAction.showNotification({
                        message: 'Hold scopes arrived.',
                        level: Constant.NOTIFICATION_LEVELS.SUCCESS
                    });
                    callback(null, data);
                }).catch(e => {
                    callback(e);
                });
            },
            (callback) => {
                RequestHandler.post(url, taskScopeHeader).then((data) => {
                    AppAction.showNotification({
                        message: 'Task scopes arrived.',
                        level: Constant.NOTIFICATION_LEVELS.SUCCESS
                    });
                    callback(null, data);
                }).catch(e => {
                    callback(e);
                });
            },
            (callback) => {
                RequestHandler.post(url, bidScopeHeader).then((data) => {
                    AppAction.showNotification({
                        message: 'Bid scopes arrived.',
                        level: Constant.NOTIFICATION_LEVELS.SUCCESS
                    });
                    callback(null, data);
                }).catch(e => {
                    callback(e);
                });
            }
        ], (error, result) => {
            if (!error) {
                this.getHomePageScopeSuccess(result);
            }
        });
    }

    getUsersActiveScopes(userId) {
        let url = 'scope/users/scopes';
        let self = this;
        let user = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.ACTIVE_PROJECTS
        };
        RequestHandler.post(url, user).then((data) => {
            self.getActiveScopesSuccess({ scopes: data, userId: userId });
        }).catch(() => {
            self.resetData();
        });
    }

    getUsersHoldScopes(userId) {
        let url = 'scope/users/scopes';
        let self = this;
        let user = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.ON_HOLD
        };
        RequestHandler.post(url, user).then((data) => {
            self.getHoldScopesSuccess({ scopes: data, userId: userId });
        }).catch(() => {
            self.resetData();
        });
    }

    getUsersBidScopes(userId) {
        let url = 'scope/users/scopes';
        let self = this;
        let user = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.BIDS
        };
        RequestHandler.post(url, user).then((data) => {
            self.getBidsScopesSuccess({ scopes: data, userId: userId });
        }).catch(() => {
            self.resetData();
        });
    }

    getUsersTaskScopes(userId) {
        let url = 'scope/users/scopes';
        let self = this;
        let user = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.TASKS
        };
        RequestHandler.post(url, user).then((data) => {
            self.getTasksScopesSuccess({ scopes: data, userId: userId });
        }).catch(() => {
            self.resetData();
        });
    }

    getUsersCompletedScopes(userId, skip, limit) {
        let url = 'scope/users/scopes';
        let self = this;
        let user = {
            userId: userId,
            groupId: Constant.TASK_GROUP__ID.COMPLETED_PROJECTS,
            skip: skip,
            limit: limit
        };
        RequestHandler.post(url, user).then((data) => {
            self.getCompletedScopesSuccess(data);
        }).catch(() => {
            self.resetData();
        });
    }


    /**
     * Check whether the project name already exist or not
     */
    isProjectNameExist(contractorName, projectName) {
        let url = 'tasks/exist';
        let req = {
            contractorName,
            projectName
        };
        RequestHandler.post(url, req).then((data) => {
            if (data.length !== 0) {
                let payload = {
                    data: data,
                    type: 'duplicateProjectNameMSG',
                    errorMsg: Constant.NOTIFICATION_MESSAGES.TASK_FORM.DUPLICATE_PROJECT_NAME
                };
                this.setDuplicateProjectTaskData(payload);
            } else {
                let payload = {
                    type: 'duplicateProjectNameMSG',
                    errorMsg: ''
                };
                this.resetDuplicateProjectName(payload);
            }
        }).catch((e) => {
            console.log(e);
        });
    }
    /**
     * Reset Duplicate Project Name and error message for Duplicate project name
    */
    clearDuplicateProjectName() {
        let payload = {
            type: 'duplicateProjectNameMSG',
            errorMsg: ''
        };
        this.resetDuplicateProjectName(payload);
    }

    getScopeInvoicePageScopes(userID) {
        let url = 'invoice/getHoldInvoices';
        let self = this;
        let user = {
            userID
        };
        RequestHandler.post(url, user).then((data) => {
            self.getScopeInvoicePageScopesSuccess(data);
        }).catch(() => {
            self.resetData();
        });
    }

    syncContractor(userID, contactID, taskID) {
        let url = 'agreement/sync-contractor-details';
        let reqData = {
            contactID,
            taskID,
            userID
        };
        RequestHandler.post(url, reqData).then((data) => {
            if (data.status === 200) {
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK_ASSIGEND.TASK_CONTRACT, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            }
            this.syncContractorSuccess(data);
        }).catch(() => {
            this.resetData();
        });
    }

    getAccordionStatus(userID) {
        const accordionStatus = JSON.parse(localStorage.getItem(userID));
        this.getAccordionStatusSuccess(accordionStatus);
    }

    setAccordionStatus(statusObject) {
        localStorage.setItem(statusObject.userID, JSON.stringify(statusObject.accordionStatus));
        this.setAccordionStatusSuccess(statusObject.accordionStatus);
    }

    resetUpdateReport() {
        this.resetUpdateReportFlag();
    }
}
export default alt.createActions(TaskAction);
