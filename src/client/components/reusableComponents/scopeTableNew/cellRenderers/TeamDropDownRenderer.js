import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import DropdownNew from '../../../../baseComponents/DropdownNew';
import { PLPPureComponent } from '../../../../baseComponents/importer';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import { updateScope } from '../../../../service/scopeService';
import { getTaskNumber, sortEmployee } from '../../../../utils/common';
import { showFaliureNotification, showSuccessNotification } from '../../../../utils/notifications';
import { updateTaskManager } from '../../../../utils/promises/TaskPromises';
import * as Constant from '../../../helpers/Constant';
import MemberProfilePic from '../../MemberProfilePic';
import { getDrafters, getManagersAndEngineers, getOtherEmployees } from '../ScopeTableUtils';
import { UtilModel } from '../../../../model/AppModels/UtilModel';
import { getUsersTotalUrgentNonUrgentHours } from '../../../../utils/promises/UserPromises';

class TeamDropDownRenderer extends PLPPureComponent {

    handleTeamMemberChange = (event, type, scope) => {
        let taskId = null;
        if (typeof scope === 'string') {
            scope = ScopeModel.get(scope).props;
            taskId = scope.task._id;
        } else if (typeof scope === 'object') {
            taskId = this.props.value.taskId;
        }
        const selectedEmployee = this.props.employees.find(employee => employee._id === event.item.props.id);
        if (!scope || !selectedEmployee || !taskId) {
            return;
        }

        let payload = {};
        switch (type) {
            case 'manager':
                payload = {
                    managerId: selectedEmployee._id,
                    groupId: scope.group._id
                };
                updateTaskManager(this.props.value.task_Id, payload)
                    .then(async response => {
                        await getUsersTotalUrgentNonUrgentHours()
                        if (UtilModel.last().props.isUninvoicedPageOpen) {
                            ScopeModel.saveAll(response.data.map(scope => new ScopeModel({ ...scope, invoiceType: { _id: 1 } })));
                            // result.invoiceType = { _id: 1 }
                        } else {
                            ScopeModel.saveAll(response.data.map(scope => new ScopeModel(scope)));
                        }
                        SelectedTaskDetailModel.updateTaskManager(response.data, taskId)
                        showSuccessNotification(`${selectedEmployee.firstName} ${selectedEmployee.lastName} has been assigned as Manager for Task ${getTaskNumber(response.data[0].task)}`)
                    })
                    .catch((e) => {
                        console.log(e)
                        showFaliureNotification(`Failed to Update Manager for Task ${getTaskNumber(scope.task)}`)

                    });
                break;
            case 'engineer':
                payload = {
                    id: scope.id,
                    engineerDetails: {
                        engineer: selectedEmployee._id,
                        status: scope.engineerDetails.status,
                        urgentHours: scope.engineerDetails.urgentHours,
                        nonUrgentHours: scope.engineerDetails.nonUrgentHours,
                    }
                };
                updateScope(payload, 'engineer', taskId);
                break;
            case 'drafter':
                payload = {
                    id: scope.id,
                    drafterDetails: {
                        drafter: selectedEmployee._id,
                        status: scope.drafterDetails.status,
                        urgentHours: scope.drafterDetails.urgentHours,
                        nonUrgentHours: scope.drafterDetails.nonUrgentHours,
                    }
                };
                updateScope(payload, 'drafter', taskId);
                break;
        }
    };

    render() {
        const isTask = this.props.data.group.id === Constant.TASK_GROUP_TITLE_ID.TASKS.ID;
        const { managerName, managerImage, engineerName, engineerImage,
            drafterName, drafterImage, managerId, engineerId, drafterId, fetchScope } = this.props.value;    // fetch scope is used to differentialte between data comming from table and popup as table gived scope Id and we need t fetch scope from scopemodel
        let scope = null;
        if (fetchScope) {
            scope = this.props.data.id;
        } else {
            scope = this.props.data
        }

        const { employees } = this.props;
        const managerList = isTask ? getOtherEmployees(employees, managerId) : getManagersAndEngineers(employees, managerId);
        const engineerList = isTask ? getOtherEmployees(employees, engineerId) : getManagersAndEngineers(employees, engineerId);
        const drafterList = isTask ? getOtherEmployees(employees, drafterId) : getDrafters(employees, drafterId);
        return (<div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: 'center', height: '35px' }}>
            <DropdownNew
                id='manager'
                menuList={managerList}
                handleDropdownChange={this.handleTeamMemberChange}
                data={scope}
            >
                <MemberProfilePic image={managerImage} name={managerName} />
            </DropdownNew>
            <DropdownNew
                id='engineer'
                menuList={engineerList}
                handleDropdownChange={this.handleTeamMemberChange}
                data={scope}
            >
                <MemberProfilePic image={engineerImage} name={engineerName} />
            </DropdownNew>
            <DropdownNew
                id='drafter'
                menuList={drafterList}
                handleDropdownChange={this.handleTeamMemberChange}
                data={scope}
            >
                <MemberProfilePic image={drafterImage} name={drafterName || 'AD'} />
            </DropdownNew>
        </div>);
    }
}

function mapStateToProps() {
    return {
        employees: sortEmployee(EmployeeModel.list().map(item => item.props))
    };
}

export default connect(mapStateToProps)(TeamDropDownRenderer)
