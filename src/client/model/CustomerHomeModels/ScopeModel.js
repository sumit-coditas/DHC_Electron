/* eslint-disable no-useless-constructor */
import { BaseModel } from '../BaseModel';
import cloneDeep from 'lodash/cloneDeep';
import { SelectedTaskDetailModel } from '../TaskModels/SelectedTaskDetailModel';
import { UtilModel } from '../AppModels/UtilModel';
import { getScope } from '../../utils/promises/ScopePromises';

export class ScopeModel extends BaseModel {

    static resource = 'scope';

    constructor(properties) {
        super(properties);
    }

    static getScopeId(id) {
        return cloneDeep(this.get(id));
    }

    static resetScope(id) {
        const scope = this.getScopeId(id);
        if (!scope) {
            return;
        }
        new ScopeModel(scope.props).$save();
    }

    resetUrgentHours(val, userId) {
        if (this.props.managerDetails.manager._id === userId) {
            this.props.managerDetails.urgentHours = val;
        }
        if (this.props.engineerDetails.engineer._id === userId) {
            this.props.engineerDetails.urgentHours = val;
        }
        if (this.props.drafterDetails.drafter && scope.drafterDetails.drafter._id === userId) {
            this.props.drafterDetails.urgetnHouts = val;
        }
        new ScopeModel(scope.props).$save()
    }

    static updateScope(result) {
        if (UtilModel.last().props.isUninvoicedPageOpen) {
            result.invoiceType = { _id: 1 }
        }
        const oldScope = this.getScopeId(result.id);
        if (!oldScope) {
            ScopeModel.fetchNewScopes([result.id])
            return;
        };
        new ScopeModel({ ...oldScope.props, ...result }).$save();
    }

    static updateMultipleScopesTask(result) {
        let filteredScopes = cloneDeep(ScopeModel.list().filter(({ props }) => props.task.id === result.id));
        filteredScopes.forEach(item => item.props.task = {
            ...item.props.task,
            ...result
        });
        ScopeModel.saveAll(filteredScopes.map(scope => new ScopeModel(scope.props)))
    }

    static updateScopeEngineer(result, engineer) {
        const oldScope = this.getScopeId(result.id);
        if (!oldScope) return;
        const scope = { ...oldScope.props, ...result };
        scope.engineerDetails.engineer = engineer;
        new ScopeModel(scope).$save();
    }

    static updateScopeDrafter(result, drafter) {
        const oldScope = this.getScopeId(result.id);
        if (!oldScope) return;
        const scope = { ...oldScope.props, ...result };
        scope.drafterDetails.drafter = drafter;
        new ScopeModel(scope).$save();
    }

    static updateMultipleScopes(result, taskId) {
        const newScopes = [];
        result.forEach(updatedScope => {
            const scopeInstance = ScopeModel.getScopeId(updatedScope.id);
            if (scopeInstance) {
                newScopes.push({ ...scopeInstance.props, ...updatedScope });
            }
        });
        ScopeModel.saveAll(newScopes.map(scope => new ScopeModel(scope)));
    }

    static addNewScopes(result) {
        let taskId;
        const scopeToAddInTaskModel = result.map((scope) => {
            const newScope = { ...scope };
            newScope.task = { ...scope.task };
            taskId = newScope.task.id;
            newScope.task = scope.task._id;
            return newScope
        });
        SelectedTaskDetailModel.addNewScopes(scopeToAddInTaskModel, taskId);
        if (UtilModel.last().props.isUninvoicedPageOpen) {  // done for adding new scopes when on uninvoiced page as that page has no selectoe available
            ScopeModel.saveAllOnTop(result.map(scope => new ScopeModel({ ...scope, invoiceType: { _id: 1 } })));
        } else {
            ScopeModel.saveAllOnTop(result.map(scope => new ScopeModel(scope)));
        }
    }

    static addHourToScope(data, taskId) {
        let scopeInstance = this.getScopeId(data.id);
        if (!scopeInstance) return;
        const isExist = scopeInstance.props.hourTrackers.find(hour => hour.id == data.hourtracker.id)
        if (isExist) {
            ScopeModel.updateHourFromScope({ scopeId: data.id, hourtracker: data.hourtracker })
            return
        }
        scopeInstance.props.hourTrackers.push(data.hourtracker);
        new ScopeModel(scopeInstance.props).$save();
        SelectedTaskDetailModel.addHourToScope(data, taskId);
    }

    static removeHourFromScope(data, taskId) {
        let scopeInstance = this.getScopeId(data.id);
        if (!scopeInstance) return;
        scopeInstance.props.hourTrackers = scopeInstance.props.hourTrackers.filter(item => item.id !== data.hourTracker);
        new ScopeModel(scopeInstance.props).$save();
        SelectedTaskDetailModel.removeHourFromScope(data, taskId);
    }

    static updateHourFromScope(data) {
        // const scopeInstance = ScopeModel.getScopeId(data.scopeId)
        // if (scopeInstance) {
        //     const index = scopeInstance.props.hourTrackers.findIndex(hour => hour._id === data.hourtracker._id)
        //     if (index == -1) return
        //     // scopeInstance.props.hourTrackers[index] = { ...scopeInstance.props.hourTrackers[index], ...data.hourtracker }
        //     const hourTrackers = scopeInstance.props.hourTrackers;
        //     hourTrackers[index] = { ...scopeInstance.props.hourTrackers[index], ...data.hourtracker }
        //     scopeInstance.props.hourTrackers = hourTrackers
        //     new ScopeModel(scopeInstance.props).$save();
        // }
        let scopeInstance = ScopeModel.getScopeId(data.scopeId)
        if (scopeInstance) {
            scopeInstance = { ...scopeInstance.props }
            let hourTrackers = cloneDeep(scopeInstance.hourTrackers);
            hourTrackers = hourTrackers.map(hour => {
                if (hour.id === data.hourtracker.id) {
                    return {
                        ...hour,
                        ...data.hourtracker
                    }
                } else {
                    return hour
                }
            })
            scopeInstance.hourTrackers = hourTrackers
            new ScopeModel(scopeInstance).$save();
        }
    }

    static updateScopeHighlight(highlights, scopeId) {
        let scopeInstance = this.getScopeId(scopeId);
        if (!scopeInstance) return;
        scopeInstance.props.highlights = highlights;
        new ScopeModel(scopeInstance.props).$save();
    }

    static saveAllOnTop(instances) {
        const oldInstances = ScopeModel.list();
        const newInstanceList = [...instances, ...oldInstances]
        // ScopeModel.deleteAll();
        ScopeModel.saveAll(newInstanceList.filter(scope => {
            if (scope.props && scope.props.id) {
                return new ScopeModel(scope.props)
            }
        }));
    }

    // socket add milestone functions
    static socket_addMileStone(type, result) {
        let mileStone = result[type] && result[type][0];
        if (mileStone) {
            let filteredScopes = cloneDeep(ScopeModel.list().filter(({ props }) => props.task.id === result.id));
            filteredScopes.forEach(scope => {
                scope.props.task[type] = [...scope.props.task[type], mileStone]
            })
            ScopeModel.saveAll(filteredScopes.map(scope => new ScopeModel(scope.props)))

            const taskInstance = SelectedTaskDetailModel.getTaskById(result.id);
            if (taskInstance) {
                let task = taskInstance.props;
                task[type].push(mileStone);
                new SelectedTaskDetailModel(task).$save();
            }
        }
    }

    static updateMultipleScopesTaskMilestones(type, result) {
        const milestoneType = `${type}s`;
        const scopeInstances = ScopeModel.list().filter(({ props }) => props.task.id === result.taskId);
        const models = scopeInstances.map(({ props }) => {
            const index = props.task[milestoneType].findIndex((item) => item.id === result[type].id);
            if (index !== -1) {
                props.task[milestoneType][index] = {
                    ...props.task[milestoneType][index],
                    ...result[type]
                };
            }
            return new ScopeModel(props)
        });
        ScopeModel.saveAll(models);
    }

    static updateMultipleScopesMilestone(type, result) {
        if (type !== 'calc') return;
        const milestoneType = `${type}s`;
        const scopeInstances = ScopeModel.list().filter(({ props }) => props.task.id === result.taskId);
        const models = scopeInstances.map(({ props }) => {
            const index = props[milestoneType].findIndex((item) => item.id === result[type].id);
            if (index !== -1) {
                props[milestoneType][index] = {
                    ...props[milestoneType][index],
                    ...result[type]
                };
            }
            return new ScopeModel(props)
        });
        ScopeModel.saveAll(models);
    }

    //this function is used to update task related milestones from coming from socket
    static socket_updateMileStone(type, result) {
        let taskInstance = SelectedTaskDetailModel.getTaskById(result.taskId);
        const milestoneType = `${type}s`;
        if (taskInstance) {
            SelectedTaskDetailModel.updateStore(type, result[type], result.taskId);

        } else {
            ScopeModel.updateMultipleScopesTaskMilestones(type, result);
        }
    }

    //this function is used to update scope related milestones from coming from socket
    static socket_updateScopeMileStone(type, result) {
        let taskInstance = SelectedTaskDetailModel.getTaskById(result.taskId);
        if (taskInstance) {
            SelectedTaskDetailModel.updateStore(type, result[type], result.taskId);
        } else {
            ScopeModel.updateMultipleScopesMilestone(type, result);
        }
    }

    // delete scopes for a given group

    static deleteSelectedGroupsScopes(groupId) {
        ScopeModel.deleteAll(ScopeModel.list().filter(({ props }) => props.group._id === groupId));
    }

    static fetchNewScopes(ids) {
        ids = Array.isArray(ids) && ids || [ids]
        const scopeFetchCalls = ids.map(id => getScope(id));
        Promise.all(scopeFetchCalls)
            .then(result => {
                result = result.filter(scope => {
                    if (scope && scope.id) {
                        if (UtilModel.last().props.isUninvoicedPageOpen) {
                            scope.invoiceType = { _id: 1 }
                        }
                        return scope
                    }
                })
                ScopeModel.saveAllOnTop(result.map(scope => new ScopeModel(scope)))
                // if (UtilModel.last().props.isUninvoicedPageOpen) {
                //     ScopeModel.saveAllOnTop(result.filter(scope => {
                //         if (scope && scope.id) {
                //             return new ScopeModel({ ...scope, invoiceType: { _id: 1 } })
                //         }
                //     }))
                //     return;
                // }
                // ScopeModel.saveAllOnTop(result.filter(scope => {
                //     if (scope && scope.id) {
                //         return new ScopeModel(scope)
                //     }
                // }))
            })
    }
}
