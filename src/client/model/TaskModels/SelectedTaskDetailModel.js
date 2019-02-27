/* eslint-disable no-useless-constructor */
import cloneDeep from 'lodash/cloneDeep';

import Constant from '../../components/helpers/Constant';
import { BaseModel } from '../BaseModel';
import { ScopeModel } from '../CustomerHomeModels/ScopeModel';
import { find } from 'lodash/find';


export class SelectedTaskDetailModel extends BaseModel {
    static resource = 'selected_task_detail';

    constructor(properties) {
        super(properties);
    }

    static getTaskById(id) {
        return cloneDeep(this.get(id));
    }

    static reset() {
        let task = this.list()[0];
        new SelectedTaskDetailModel(task.props).$save();
    }

    // ***************************** functions to update milestones related to task *******************************

    static updateStore(type, data, taskId) {
        switch (type) {
            case Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT.type:
                SelectedTaskDetailModel.updateAgreement(data, taskId);
                break;

            case Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT.type:
                SelectedTaskDetailModel.updateModifiedAgreement(data, taskId);
                break;

            case Constant.DOC_TYPES.MASTER_AGREEMENT.type:
                SelectedTaskDetailModel.updateMasterAgreement(data, taskId);
                break;

            case Constant.DOC_TYPES.CLIENT_AGREEMENT.type:
                SelectedTaskDetailModel.updateClientAgreement(data, taskId);
                break;

            case Constant.DOC_TYPES.PURCHASE_ORDER.type:
                SelectedTaskDetailModel.updatePurchaseOrder(data, taskId);
                break;

            case Constant.DOC_TYPES.INVOICE.type:
                SelectedTaskDetailModel.updateInvoice(data, taskId);
                break;

            case Constant.DOC_TYPES.DRAWINGS.type:
                SelectedTaskDetailModel.updateDrawing(data, taskId);
                break;

            case Constant.DOC_TYPES.CALCS.type:
                SelectedTaskDetailModel.updateCalc(data, taskId);
                break;

            case Constant.DOC_TYPES.SCOPE.type:
                SelectedTaskDetailModel.updateScope(data, taskId);
                break;

            case Constant.DOC_TYPES.TAGS.type:
                SelectedTaskDetailModel.updateTags(data, taskId);
                break;

            case Constant.DOC_TYPES.CUST_DRAWING.type:
                SelectedTaskDetailModel.updateCustomerDrawing(data, taskId);
                break;

            case Constant.DOC_TYPES.LETTER.type:
                SelectedTaskDetailModel.updateLetter(data, taskId);
                break;

            case Constant.DOC_TYPES.TAB_DATA.type:
                SelectedTaskDetailModel.updateTabData(data, taskId);
                break;

            case Constant.DOC_TYPES.SCOPE_PLANNING.type:
                SelectedTaskDetailModel.updateScopePlanning(data, taskId);
                break;

            case Constant.DOC_TYPES.SCOPE_KEYWORD.type:
                SelectedTaskDetailModel.updateScopeKeyword(data, taskId);
                break;

        }
    };

    static updateTaskDescription(result, taskId) {
        let task = this.getTaskById(taskId);
        if (task) {
            task.props = {
                ...task.props,
                ...result
            };
            new SelectedTaskDetailModel(task.props).$save();
        }
        ScopeModel.updateMultipleScopesTask(result);
    }

    static updatePurchaseOrder(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.purchaseOrders.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.purchaseOrders[index] = result;
        new SelectedTaskDetailModel(task.props).$save();
        ScopeModel.updateMultipleScopesTask({ id: taskId, purchaseOrders: task.props.purchaseOrders });
    }

    // static updateInvoice(result, taskId) {
    //     let task = this.getTaskById(taskId);
    //     const index = task.props.invoices.findIndex((item) => item.id === result.id);
    //     if (index === -1) {
    //         return;
    //     }
    //     task.props.invoices[index] = {
    //         ...task.props.invoices[index],
    //         ...result
    //     };
    //     if (result.selectedScopes) {
    //         result.selectedScopes.forEach(({ scope }) => {
    //             SelectedTaskDetailModel.updatePriceInOtherInvoices(scope, task.props.invoices);
    //             let oldScope = task.props.scopes.find(item => item.id === scope.id);
    //             if (oldScope) {
    //                 oldScope.price = scope.price;
    //             }
    //         });
    //     }
    //     // consle.log('final result', result)
    //     new SelectedTaskDetailModel(task.props).$save();
    //     ScopeModel.updateMultipleScopesTask({ id: taskId, invoices: task.props.invoices });
    //     ScopeModel.updateMultipleScopes(task.props.scopes.map(({ id, price }) => ({ id, price })), taskId);
    // }

    static updateAgreement(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.agreements.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.agreements[index] = {
            ...task.props.agreements[index],
            ...result
        };
        new SelectedTaskDetailModel(task.props).$save();
        ScopeModel.updateMultipleScopesTask({ id: taskId, agreements: task.props.agreements });
    }

    static updateClientAgreement(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.clientAgreements.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.clientAgreements[index] = {
            ...task.props.clientAgreements[index],
            ...result
        };
        new SelectedTaskDetailModel(task.props).$save();
        ScopeModel.updateMultipleScopesTask({ id: taskId, clientAgreements: task.props.clientAgreements });
    }

    static updateMasterAgreement(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.masterAgreements.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.masterAgreements[index] = {
            ...task.props.masterAgreements[index],
            ...result
        };
        new SelectedTaskDetailModel(task.props).$save();
        ScopeModel.updateMultipleScopesTask({ id: taskId, masterAgreements: task.props.masterAgreements });
    }

    static updateModifiedAgreement(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.modifiedAgreements.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.modifiedAgreements[index] = {
            ...task.props.modifiedAgreements[index],
            ...result
        };
        new SelectedTaskDetailModel(task.props).$save();
        ScopeModel.updateMultipleScopesTask({ id: taskId, modifiedAgreements: task.props.modifiedAgreements });
    }

    static updateDrawing(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.drawings.findIndex(drawing => drawing.id === result.id);
            if (index === -1) {
                return;
            }
            scope.drawings[index] = {
                ...scope.drawings[index],
                ...result
            };
            selectedScope = scope;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateTags(tags, taskId) {
        let task = this.getTaskById(taskId);
        if (!task) return;
        task.props.tags = tags;
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateCustomerDrawing(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.custDrawings.findIndex(custDrawing => custDrawing.id === result.id);
            if (index === -1) {
                return;
            }
            scope.custDrawings[index] = {
                ...scope.custDrawings[index],
                ...result
            };
            selectedScope = scope;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateLetter(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.letters.findIndex(letter => letter.id === result.id);
            if (index === -1) {
                return;
            }
            scope.letters[index] = {
                ...scope.letters[index],
                ...result
            };
            selectedScope = scope;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateTabData(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.tabData.findIndex(data => data.id === result.id);
            if (index === -1) {
                return;
            }
            scope.tabData[index] = {
                ...scope.tabData[index],
                ...result
            };
            selectedScope = scope;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }
    static updateTabData(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.tabData.findIndex(data => data.id === result.id);
            if (index === -1) {
                return;
            }
            scope.tabData[index] = {
                ...scope.tabData[index],
                ...result
            };
            selectedScope = scope;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateScopePlanning(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.scopePlannings.findIndex(data => data.id === result.id);
            if (index === -1) {
                return;
            }
            scope.scopePlannings[index] = {
                ...scope.scopePlannings[index],
                ...result
            };
            selectedScope = scope;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateScopeKeyword(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        if (task.props) {
            task.props.scopes.forEach((scope) => {
                const index = scope.scopeKeywords.findIndex(data => data.id === result.id);
                if (index === -1) {
                    return;
                }
                scope.scopeKeywords[index] = {
                    ...scope.scopeKeywords[index],
                    ...result
                };
                selectedScope = scope;
            });
            new SelectedTaskDetailModel(task.props).$save();
        }
    }

    static updateCustomerContactsList(result, taskId) {
        let task = this.getTaskById(taskId);
        task.props.customerContactsList = result;
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateCalc(result, taskId) {
        let task = this.getTaskById(taskId);
        let selectedScope = null;
        task.props.scopes.forEach((scope) => {
            const index = scope.calcs.findIndex(calc => calc.id === result.id);
            if (index === -1) {
                return;
            }
            scope.calcs[index] = {
                ...scope.calcs[index],
                ...result
            };
            selectedScope = scope;
            ScopeModel.updateScope({ id: scope.id, calcs: scope.calcs });
        });
        new SelectedTaskDetailModel(task.props).$save();

    }

    static updateScopes(results, taskId) {
        let task = this.getTaskById(taskId);
        if (!task) {
            return;
        }
        results.forEach((scope) => {
            const index = task.props.scopes.findIndex(tscope => tscope.id === scope.id);
            if (index === -1) {
                return;
            }
            task.props.scopes[index] = {
                ...task.props.scopes[index],
                ...scope
            };
            task = this.updateMilestonesSelectedScope(task, task.props.scopes[index]);
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateScope(result, taskId) {

        let task = this.getTaskById(taskId);
        if (!task) return;

        const index = task.props.scopes.findIndex((item) => item.id === result.id);
        if (index === -1) return;

        task.props.scopes[index] = {
            ...task.props.scopes[index],
            ...result
        };
        task = this.updateMilestonesSelectedScope(task, task.props.scopes[index]);

        new SelectedTaskDetailModel(task.props).$save();
        let updatedScope = {
            ...task.props.scopes[index]
        };
        delete updatedScope.task;
        ScopeModel.updateScope(updatedScope);

    }

    static updateMilestonesSelectedScope(task, scope) {

        task.props.invoices.forEach(invoice => {
            invoice.selectedScopes.forEach(selectedScope => {
                if (selectedScope.scope.id === scope.id) {
                    selectedScope.scope.price = scope.price;
                    selectedScope.scope.isArchived = scope.isArchived;
                    selectedScope.scope.note = scope.note;
                    selectedScope.description = scope.definition;
                }
            });
        })
        task.props.purchaseOrders.forEach(purchaseOrder => {
            purchaseOrder.selectedScopes.forEach(selectedScope => {
                if (selectedScope.id === scope.id) {
                    selectedScope.isArchived = scope.isArchived;
                    selectedScope.note = scope.note;
                }
            });
        })

        task.props.modifiedAgreements.forEach(modifiedAgreement => {
            modifiedAgreement.selectedScopes.forEach(selectedScope => {
                if (selectedScope.id === scope.id) {
                    selectedScope.isArchived = scope.isArchived;
                    selectedScope.note = scope.note;
                }
            });
        })
        task.props.masterAgreements.forEach(masterAgreement => {
            masterAgreement.selectedScopes.forEach(selectedScope => {
                if (selectedScope.id === scope.id) {
                    selectedScope.isArchived = scope.isArchived;
                    selectedScope.note = scope.note;
                }
            });
        })
        task.props.agreements.forEach(agreement => {
            agreement.selectedScopes.forEach(selectedScope => {
                if (selectedScope.id === scope.id) {
                    selectedScope.isArchived = scope.isArchived;
                    selectedScope.note = scope.note;
                }
            });
        })
        task.props.clientAgreements.forEach(clientAgreement => {
            clientAgreement.selectedScopes.forEach(selectedScope => {
                if (selectedScope.id === scope.id) {
                    selectedScope.isArchived = scope.isArchived;
                    selectedScope.note = scope.note;
                }
            });
        })
        return task;
    }

    static updateScopeModelTaskModel(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.scopes.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.scopes[index] = {
            ...task.props.scopes[index],
            ...result
        };
        new SelectedTaskDetailModel(task.props).$save();
        const scopes = ScopeModel.list();
        const filteredScopes = scopes.filter(scope => scope.props.task.id === taskId);
        filteredScopes.forEach(item => item.props.task = {
            ...item.props.task,
            ...result
        });
        ScopeModel.saveAll(filteredScopes.map(scope => new ScopeModel(scope.props)));
    }

    static updateComment(taskId, result, user) {
        let task = this.getTaskById(taskId);
        if (!task) return;
        const index = task.props.comments.findIndex((item) => item.id === result.id);

        if (index === -1) return;

        result.postedBy = {
            employeeCode: user.employeeCode,
            firstName: user.firstName,
            lastName: user.lastName,
            picture: user.picture,
            id: user.id,
            role: user.role._id,
            _id: user._id
        };

        task.props.comments = [
            ...task.props.comments.slice(0, index),
            {
                ...task.props.comments[index],
                ...result
            },
            ...task.props.comments.slice(index + 1)
        ];

        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateHourTrackRecord(result, taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            return;
        }
        const index = task.props.scopes.findIndex((item) => item.id === result.scopeId);
        if (index === -1) {
            return;
        }
        task.props.scopes[index].hourTrackers = task.props.scopes[index].hourTrackers.map((record) => {
            if (record.id === result.hourtracker.id) {
                return { ...record, ...result.hourtracker };
            }
            return record;
        });
        new SelectedTaskDetailModel(task.props).$save();
    }

    static updateTaskManager(result, taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            return;
        }

        task.props.scopes = result.map(scope => ({ ...scope, task: scope.task._id }))
        new SelectedTaskDetailModel(task.props).$save();
    }


    // ***************************** functions to add milestones to task *******************************

    static addToStore(type, data) {
        switch (type) {
            case Constant.DOC_TYPES.PURCHASE_ORDER.type:
                SelectedTaskDetailModel.addDataToTask('purchaseOrders', data);
                break;

            case Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT.type:
                SelectedTaskDetailModel.addDataToTask('agreements', data);
                break;

            case Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT.type:
                SelectedTaskDetailModel.addDataToTask('modifiedAgreements', data);
                break;

            case Constant.DOC_TYPES.MASTER_AGREEMENT.type:
                SelectedTaskDetailModel.addDataToTask('masterAgreements', data);
                break;

            case Constant.DOC_TYPES.CLIENT_AGREEMENT.type:
                SelectedTaskDetailModel.addDataToTask('clientAgreements', data);
                break;

            case Constant.DOC_TYPES.INVOICE.type:
                SelectedTaskDetailModel.addDataToTask('invoices', data);
                break;
        }
    };

    static addDataToTask(type, data) {
        const taskInstance = this.getTaskById(data.id);
        if (taskInstance) {
            data[type] = { ...data[type][0] }
            let task = taskInstance.props;
            task[type].push(data[type]);

            if (type === 'invoices' && data[type].selectedScopes) {
                data[type].selectedScopes.forEach(({ scope }) => {
                    SelectedTaskDetailModel.updatePriceInOtherInvoices(scope, task.invoices);
                    let oldScope = task.scopes.find(item => item.id === scope.id);
                    if (oldScope) {
                        oldScope.price = scope.price;
                    }
                });
            }
            new SelectedTaskDetailModel(task).$save();
            ScopeModel.updateMultipleScopesTask({ id: data.id, [type]: task[type] });
        }
    }

    static updateInvoice(result, taskId) {
        let task = this.getTaskById(taskId);
        const index = task.props.invoices.findIndex((item) => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.invoices[index] = {
            ...task.props.invoices[index],
            ...result
        };
        if (result.selectedScopes) {
            result.selectedScopes.forEach(({ scope }) => {
                SelectedTaskDetailModel.updatePriceInOtherInvoices(scope, task.props.invoices);
                let oldScope = task.props.scopes.find(item => item.id === scope.id);
                if (oldScope) {
                    oldScope.price = scope.price;
                }
            });
        }
        // consle.log('final result', result)
        new SelectedTaskDetailModel(task.props).$save();
        ScopeModel.updateMultipleScopesTask({ id: taskId, invoices: task.props.invoices });
        ScopeModel.updateMultipleScopes(task.props.scopes.map(({ id, price }) => ({ id, price })), taskId);
    }

    static addComment(taskId, result, user) {
        let task = this.getTaskById(taskId);
        if (!task) return;
        result.postedBy = {
            employeeCode: user.employeeCode,
            firstName: user.firstName,
            lastName: user.lastName,
            picture: user.picture,
            id: user.id,
            role: user.role._id,
            _id: user._id
        };
        task.props.comments = [...task.props.comments, result];
        new SelectedTaskDetailModel(task.props).$save();
    }

    static addHourToScope(result, taskId) {
        const task = SelectedTaskDetailModel.getTaskById(taskId);
        if (!task) {
            return;
        }
        const index = task.props.scopes.findIndex(item => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.scopes[index].hourTrackers = [...task.props.scopes[index].hourTrackers, result.hourtracker];
        new SelectedTaskDetailModel(task.props).$save();
    }

    // static addInvoice(result, taskId) {
    //     let task = this.getTaskById(taskId);
    //     const index = task.props.invoices.findIndex((item) => item.id === result.id);
    //     if (index === -1) {
    //         task.props.invoices.push(result)
    //         new SelectedTaskDetailModel(task.props).$save();
    //     } else {
    //         task.props.invoices[index] = {
    //             ...task.props.invoices[index],
    //             ...result
    //         };
    //         new SelectedTaskDetailModel(task.props).$save();
    //     }
    //     ScopeModel.updateMultipleScopesTask({ id: taskId, invoices: task.props.invoices });
    // }

    static addNewScopes(scopes, taskId) {
        let task = this.getTaskById(taskId);
        if (!task) return;
        task.props.scopes = [...task.props.scopes, ...scopes];
        new SelectedTaskDetailModel(task.props).$save();
    }

    // ***************************** functions to delete milestones to task *******************************

    static deleteComment(taskId, result) {
        let task = this.getTaskById(taskId);
        if (!task) return;
        task.props.comments = [...task.props.comments.filter(item => item.id !== result.id)];
        new SelectedTaskDetailModel(task.props).$save();
    }

    static removeHourFromScope(result, taskId) {
        const task = SelectedTaskDetailModel.getTaskById(taskId);
        if (!task) {
            return;
        }
        const index = task.props.scopes.findIndex(item => item.id === result.id);
        if (index === -1) {
            return;
        }
        task.props.scopes[index].hourTrackers = task.props.scopes[index].hourTrackers.filter(item => item._id !== result.hourTracker);
        new SelectedTaskDetailModel(task.props).$save();
    }

    // ***************************** other functions to manuplate task data *******************************
    static syncContractorDetails(result, taskId) {
        let task = this.getTaskById(result.id);
        task = { ...task.props, contractor: result.contractor }
        new SelectedTaskDetailModel(task).$save();
        const scopes = ScopeModel.list();
        const filteredScopes = scopes.filter(scope => scope.props.task.id === result.id);
        filteredScopes.forEach(scope => {
            scope.props.task.contractor = result.contractor
        })
        ScopeModel.saveAll(filteredScopes.map(scope => new ScopeModel(scope.props)))
    }

    // utility function for updating price of scope selected in other invoices.
    static updatePriceInOtherInvoices = (scope, taskInvoices = []) => {
        taskInvoices.forEach(invoice => {
            invoice.selectedScopes.forEach(selectedScope => {
                if (selectedScope.scope.id === scope.id) {
                    selectedScope.scope.price = scope.price;
                }
            });
        });
    }
}
