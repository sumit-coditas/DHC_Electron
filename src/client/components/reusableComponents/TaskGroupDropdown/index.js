import { Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { PLPPureComponent, PLPSelect } from '../../../baseComponents/importer';
import { EmployeeModel } from '../../../model/AppModels/EmployeeModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { getTaskNumber, sortEmployee } from '../../../utils/common';
import { showFaliureNotification, showNotification, showSuccessNotification } from '../../../utils/notifications';
import { updateScope } from '../../../utils/promises/ScopePromises';
import { getUsersTotalUrgentNonUrgentHours, getTodaysLoggedHoursOfUser } from '../../../utils/promises/UserPromises';
import { changeGroup, getMaxTaskNumber, renameProjectFolder, updateBidScopeGroup } from '../../../utils/promises/TaskPromises';
import Constant from '../../helpers/Constant';
import { getContractorName, getProjectPath, padWithZeros } from '../scopeTableNew/ScopeTableUtils';
import { groupNames, options, taskID } from './Constants';
import { UtilModel } from '../../../model/AppModels/UtilModel';
import { UserModel } from '../../../model/UserModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { showConfirmationModal } from '../../../utils/cofirmationModal';
import ReportAction from '../../../actions/ReportAction';
import ReportStore from '../../../stores/ReportStore';

class TaskGroupDropdown extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            // taskGroup: this.props.scope.group.title[0].toUpperCase(),
            showPopup: false,
            newTaskGroupId: null
        };
    }

    handleGroupChange = (value) => {
        const option = options[this.props.scope.group.id].find(item => item.value === value);
        if (!option) return;
        const newTaskGroupId = option.key;
        this.setState({
            newTaskGroupId
        }, () => showConfirmationModal(
            `Are you sure?`,
            `You want to move this scope to ${groupNames[newTaskGroupId]}`,
            this.handleChangeGroupConfirmation,
            this.handleCancelClick
        ));
    };

    getNewStatus = () => {
        const { group } = this.props.scope;
        const { newTaskGroupId } = this.state;
        if (newTaskGroupId === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
            return Constant.STATUS_OPTIONS_SEMANTIC[3].text;
        }
        if (newTaskGroupId === Constant.TASK_GROUP_ID.ACTIVE_PROJECTS && group.id === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
            return Constant.STATUS_OPTIONS_SEMANTIC[1].text;
        }
        if (newTaskGroupId === Constant.TASK_GROUP_ID.ON_HOLD && group.id === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
            return Constant.STATUS_OPTIONS_SEMANTIC[5].text;
        }
        return null;
    };

    changeGroup = (task, oldPath) => {
        changeGroup(task).then(async (response) => {
            await getUsersTotalUrgentNonUrgentHours();
            if (SelectedTaskDetailModel.last()) {
                new SelectedTaskDetailModel(response).$save();
            } ScopeModel.saveAll(response.scopes.map(scope => new ScopeModel(scope)));
            showSuccessNotification(`All scopes under Task ${getTaskNumber(task)} has moved to active group.`);
            const newPath = getProjectPath(response);
            this.renameProjectFolder({ oldPath, newPath });
        }).catch((e) => {
            showFaliureNotification('Something went wrong while moving task to active group.')
        });
    };

    // rename FTP folder in case of bid to active migration
    renameProjectFolder = (payload) => {
        renameProjectFolder(payload).then(() => {
            showSuccessNotification('FTP folder renamed successfully.');
        }).catch(() => showFaliureNotification('Failed to rename FTP.'));
    };

    // move bid scope to the active group
    moveBidScopeTaskToActive = (task, oldTaskNumber, oldPath) => {
        updateBidScopeGroup(task._id).then(() => {
            showSuccessNotification(`${oldTaskNumber} has been moved successfully to Active group.`);
            this.changeGroup(task, oldPath);
        }).catch(() => showFaliureNotification(`Failed to move scope.`));
    };

    // update scope
    updateScope = (payload, showCongratulationsPopup) => {
        updateScope(payload).then(async response => {
            await getUsersTotalUrgentNonUrgentHours()
            ReportAction.getReport(ReportStore.getState().filters);

            if (this.props.taskId) {
                const task = SelectedTaskDetailModel.getTaskById(this.props.taskId);
                const index = task.props.scopes.findIndex(scope => scope.id === response.id);
                task.props.scopes[index] = {
                    ...task.props.scopes[index],
                    ...response
                }
                new SelectedTaskDetailModel(task.props).$save();
            }
            ScopeModel.updateScope(response);
            showSuccessNotification(`Scope moved to ${response.group.title} successfully.`);
            if (showCongratulationsPopup) {
                let data = UtilModel.getUtilsData();
                data.showCongratulationsPopup = true;
                new UtilModel(data).$save()
                // this.props.handleCongratulationsPopup(true);
            }
        }).catch((e) => {
            console.log(e)
            showFaliureNotification(`Failed to move scope.`)
            this.handleCancelClick()
        });
    };

    // move bid scope task to active task group
    moveScopeToActiveGroup = () => {
        let task = this.props.scope.task;
        if (typeof task === "string") {
            task = SelectedTaskDetailModel.last().props || null;
        }
        if (!task) return;
        getMaxTaskNumber()
            .then(newTaskNumber => {
                const oldTaskNumber = getTaskNumber(task);
                let payload = { ...task };
                const oldPath = getProjectPath(task);
                payload.isBidding = false;
                payload.createdAt = new Date();
                payload.taskNumber = padWithZeros(newTaskNumber, 4);
                this.moveBidScopeTaskToActive(payload, oldTaskNumber, oldPath);
            })
            .catch((e) => {
                console.log(e);
                showNotification('We are sorry', 'Something went wrong while updating task. Please try again.', 'warning')
                this.handleCancelClick()
            });
    };

    // move any scope to complete task group
    moveScopeToCompletedGroup = () => {
        const { engineerDetails, drafterDetails, id, price } = this.props.scope;
        const { newTaskGroupId } = this.state;
        const status = this.getNewStatus();
        engineerDetails.nonUrgentHours = 0;
        engineerDetails.urgentHours = 0;
        engineerDetails.status = status;
        let payload = {
            group: taskID[newTaskGroupId],
            id,
            engineerDetails
        };
        if (drafterDetails && drafterDetails.drafter) {
            drafterDetails.status = status;
            drafterDetails.nonUrgentHours = 0;
            drafterDetails.urgentHours = 0;
            payload.drafterDetails = drafterDetails;
        }
        this.updateScope(payload, price >= 7500);
    };

    // move scope to hold task group
    moveScopeToHoldGroup = () => {
        const status = this.getNewStatus();
        const { engineerDetails, drafterDetails, id } = this.props.scope;
        const { newTaskGroupId } = this.state;
        if (status) {
            engineerDetails.status = status;
        }

        let payload = {
            group: taskID[newTaskGroupId],
            id,
            engineerDetails
        };
        if (drafterDetails && drafterDetails.drafter) {
            if (status) {
                drafterDetails.status = status;
            }
            payload.drafterDetails = drafterDetails;
        }
        this.updateScope(payload);
    };

    // handle confirmation yes click
    handleChangeGroupConfirmation = async () => {
        const { group } = this.props.scope;
        const { newTaskGroupId } = this.state;

        if (group.id === Constant.TASK_GROUP_ID.BIDS) {
            this.moveScopeToActiveGroup();
        } else if (newTaskGroupId === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
            this.moveScopeToCompletedGroup();
            await getUsersTotalUrgentNonUrgentHours(this.props.loggedInUserId);
        } else {
            this.moveScopeToHoldGroup();
        }
    };

    //cancel
    handleCancelClick = () => {
        this.setState({
            newTaskGroupId: null
        });
    };

    // return task group drop down options according to scope group
    // getTaskGroupOptions = (taskGroup) => options[`${taskGroup}`];

    // return options
    // getTaskGroup = () => {
    //     const { scope } = this.props;
    //     switch (scope.group.id) {
    //         case Constant.TASK_GROUP_ID.ACTIVE_PROJECTS:
    //             return options(Constant.TASK_GROUP_ID.ACTIVE_PROJECTS);
    //         case Constant.TASK_GROUP_ID.COMPLETED_PROJECTS:
    //             return this.options(Constant.TASK_GROUP_ID.COMPLETED_PROJECTS);
    //         case Constant.TASK_GROUP_ID.ON_HOLD:
    //             return this.options(Constant.TASK_GROUP_ID.ON_HOLD);
    //         case Constant.TASK_GROUP_ID.TASKS:
    //             return this.options(Constant.TASK_GROUP_ID.TASKS);
    //         case Constant.TASK_GROUP_ID.BIDS:
    //             return this.options(Constant.TASK_GROUP_ID.BIDS);
    //     }
    // };

    // show confirmation popup to user while moving scope to another group
    // showConfirmationPopup = ({ title = 'Confirmation', message = 'message' }) => {
    //     const confirm = Modal.confirm;
    //     confirm({
    //         title: title,
    //         content: message,
    //         okText: 'Yes',
    //         okType: 'success',
    //         cancelText: 'No',
    //         onOk: this.handleChangeGroupConfirmation,
    //         onCancel: this.handleCancelClick
    //     });
    // };

    render = () => {
        const disabled = this.props.disabled || ['Drafter', 'Admin', 'Admin/AP'].includes(this.props.loggedInUserRole)
        if (!this.props.scope) return <div />;
        return (
            <PLPSelect
                value={this.props.scope.group.title[0].toUpperCase()}
                handleChange={this.handleGroupChange}
                className='table-select'
                dropdownClassName='select-options'
                disabled={disabled}
                options={options[this.props.scope.group.id]}
            />
        )
    }
}

function mapStateToProps(scope, ownProps) {
    const loggedInUser = UserModel.last().props;
    let data = {};

    // this is used to get scopes from scope table and task popup
    if (ownProps.data) {
        const scopeInstance = ScopeModel.get(ownProps.data.id);
        if (scopeInstance) {
            data.scope = scopeInstance.props;
        } else {
            data.scope = null;
        }
    } else {
        data.scope = ownProps.scope;
    }
    data.loggedInUserRole = loggedInUser.role.name || '';
    data.loggedInUserId = loggedInUser._id;
    return data;
}

export default connect(mapStateToProps)(TaskGroupDropdown);
