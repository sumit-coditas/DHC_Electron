import React, { Component } from 'react';
import { Select } from '../../baseComponents/Select';
import { connect } from 'react-redux';
import UserListDropdown from '../reusableComponents/designAlocationTableComponent/userdropdown';
import TaskAction from '../../actions/TaskAction';
import AppAction from '../../actions/AppAction';
import { designTableHeader } from '../../utils/constants/ScopeTableHeaders';
import Constant from '../helpers/Constant';
import { FIELDS } from '../../utils/constants/ScopeTableFields';
import { getManagersAndEngineers, getDrafters, } from '../reusableComponents/scopeTableNew/ScopeTableUtils';
import { deisgnAllocationData } from '../taskGroupWrapper/util/taskPageUtil';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';
import AppStore from '../../stores/AppStore';
import LoginStore from '../../stores/LoginStore';
import { PLPDataGrid } from '../reusableComponents/PLPDataGrid';
import { sortEmployee } from '../../utils/common';
import { UserModel } from '../../model/UserModel';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { EmployeeModel } from '../../model/AppModels/EmployeeModel';

class DesignStatusNew extends PLPPureComponent {

    statusRenderer = (params) => params.data.teamRole === "PM" ? <div>-</div> : <Select
        defaultValue={[params.value]}
        handleChange={this.handleStatusChange}
        data={params}
        options={Constant.STATUS_OPTIONS_SEMANTIC}
    />;

    teamDropDownRenderer = (params) => {
        const options = params.data.teamRole == "AD" ? getDrafters(this.props.users, params.data.selectedId) : getManagersAndEngineers(this.props.users, params.data.selectedId);
        return <UserListDropdown
            menuList={options}
            userImage={params.data.userImage || ''}
            userName={params.value || params.data.teamRole}
            data={params.data}
            onMemberChange={this.handleMemberChange} />
    };

    handleCellChange = ({ oldValue, newValue, colDef, data, node }) => {
        const fieldChanged = colDef.field;
        const teamRole = data.teamRole;
        this.handleUpdateHour(oldValue, newValue, data, teamRole, fieldChanged);
    };

    handleUpdateHour = (oldValue, newValue, scope, role, hourType) => {
        let newHoursValue = newValue;
        let isHoursUpdatable = true;

        if (!newHoursValue || isNaN(newHoursValue)) {
            const requiredNotificationMessage = hourType === FIELDS.U_HRS ? Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.REQUIRED : Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.REQUIRED;
            AppAction.showNotification({ message: requiredNotificationMessage, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isHoursUpdatable = false;
            return;
        }
        if (oldValue === newValue) {
            return isHoursUpdatable = false
        }

        newHoursValue = parseFloat(newHoursValue);

        if (!(newHoursValue > 0 && newHoursValue < 1000)) {
            const rangeNotificationMessage = hourType === FIELDS.U_HRS ? Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR : Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR;
            AppAction.showNotification({ message: rangeNotificationMessage, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isHoursUpdatable = false;
            return;
        }

        if (isHoursUpdatable) {
            newHoursValue = newHoursValue.toFixed(2);
            let clonedScope = { ...scope };
            let hourDetail;
            let updatedScope;

            const key = role === "AE" ? "engineerDetails" : "drafterDetails";
            // hourDetail = clonedScope['userDetails'];
            // hourDetail[hourType] = newHoursValue;
            const updatedDetails = { ...scope.userDetails, [hourType]: newHoursValue }
            updatedScope = {
                id: clonedScope.scopeId,
                [key]: updatedDetails
            };

            this.props.updatedScope(updatedScope.id, updatedScope)
        }
    };

    handleStatusChange = (value, params) => {
        const { key, userDetails } = params.data;
        const payload = {
            [key]: { ...userDetails, status: value }
        }
        this.props.updatedScope(params.data.scopeId, payload)
    };

    handleMemberChange = (event, memberId, { scopeId, key, userDetails }) => {
        const payload = {
            [key]: { ...userDetails, [key.replace('Details', '')]: event.item.props.id }
        };
        this.props.updatedScope(scopeId, payload);
    };

    render = () => <PLPDataGrid
        columnDefs={designTableHeader}
        rowData={this.props.selectedScopes}
        onCellValueChanged={this.handleCellChange}
        frameworkComponents={{
            internalTeamDropdownRenderer: this.teamDropDownRenderer,
            statusRenderer: this.statusRenderer
        }}
    />;
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const users = EmployeeModel.list().map(item => item.props);
    const scopes = task.scopes.filter(scope => !scope.isArchived);
    return {
        selectedScopes: deisgnAllocationData(scopes, users),
        users,
        loggedInUser: UserModel.last().props,
    };
}

export default connect(mapStateToProps)(DesignStatusNew)
