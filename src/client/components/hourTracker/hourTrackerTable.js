import { Icon } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import { PLPDatePicker, PLPPureComponent } from '../../baseComponents/importer';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';
import LoginStore from '../../stores/LoginStore';
import { showConfirmationModal } from '../../utils/cofirmationModal';
import { getRoundUpHourSpent } from '../../utils/common';
import { PLPDATE_FORMAT } from '../../utils/constant';
import { hourTrackerTableHeader } from '../../utils/constants/ScopeTableHeaders';
import { getStartDateOfDay } from '../../utils/DateUtils';
import MemberProfilePic from '../reusableComponents/MemberProfilePic';
import { PLPDataGrid } from '../reusableComponents/PLPDataGrid';
import NumericEditor from '../reusableComponents/scopeTableNew/cellRenderers/NumericEditor';
import ScopeDropdown from './cellRenders/ScopeDropdown';
import { deleteHourTrack, updateHourTrack } from './service';
import { formatHourTrackerData, getScopeList } from './util';
import { HourInput } from './wrapperComponents';
import { UserModel } from '../../model/UserModel';
import { showWarningNotification } from '../../utils/notifications';

class HourTrackerTableImpl extends PLPPureComponent {

    userImageRender = (params) => <MemberProfilePic name={params.value.firstName + " " + params.value.lastName} image={params.value.picture || ''} />

    onHourUpdateApiCall(hourUpdate) {
        const taskId = this.props.taskId;
        updateHourTrack({ ...hourUpdate, taskId })
    }

    handleCellValueChanged = ({ colDef, value, data }) => {
        const scope = { [colDef.field]: value, scopeID: data.scopeId, id: data.hourId, _id: data._id, loggedInUserId: this.props.loggedInUser._id }
        this.onHourUpdateApiCall(scope)
    }

    handleChange = (value, field, data, params) => {

        if (field === 'hoursSpent') {
            value = getRoundUpHourSpent(data.hoursSpent)(value);
            if (value == 0) {
                showWarningNotification('Invalid Hours')
                params.node.data[field] = data.hoursSpent
                params.api.redrawRows({ rowNodes: [params.node] });
                return;
            }
        }
        if (data) {
            const scope = { [field]: value, scopeID: data.scopeId, id: data.hourId, _id: data._id, loggedInUserId: this.props.loggedInUser._id }
            this.onHourUpdateApiCall(scope)
        }
    }

    hourInputRender = (params) => <HourInput
        onBlur={value => this.handleChange(value, 'hoursSpent', params.data, params)}
        value={params.value}
    />

    disabledDate = (value) => value < moment().subtract(1, 'days');

    handleDuedateChange = (value, data) => {
        value = getStartDateOfDay(value)
        this.handleChange(value, 'date', data)
    }

    dateRender = (params) => {
        const { value, data } = params;
        return <PLPDatePicker
            className="dueDatePicker"
            data={data}
            disabledDate={(current) => !moment(current).isValid()} // can select any valid date date
            defaultValue={moment(value, PLPDATE_FORMAT)}
            format={PLPDATE_FORMAT}
            onChange={this.handleDuedateChange}
            autoFocus={false}
        />
    }

    handleDelete = (data) => {
        const taskId = this.props.taskId
        data.loggedInUserId = this.props.loggedInUser._id;
        const title = 'Delete  Hour Record ?', content = `Are you sure you want to delete Hour ? This action will delete hour from scope.`;
        showConfirmationModal(title, content, () => deleteHourTrack(data, taskId));
    }

    archiveIconRender = (params) => params.data.isDeletable && <Icon className="cursor-pointer" type='delete' onClick={() => this.handleDelete(params.data)} />

    render() {
        return (
            <PLPDataGrid
                columnDefs={hourTrackerTableHeader}
                rowData={this.props.rowData}
                onCellValueChanged={this.handleCellValueChanged}
                frameworkComponents={{
                    scopeDropdownRender: ScopeDropdown,
                    userImageRender: this.userImageRender,
                    hourInputRender: this.hourInputRender,
                    dateRender: this.dateRender,
                    archiveIconRender: this.archiveIconRender,
                    numericEditor: NumericEditor
                }}
            />
        );
    }
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const { id, _id, firstName, lastName, picture, email, employeeCode, role } = UserModel.last().props;
    const loggedInUser = { id, _id, firstName, lastName, picture, email, employeeCode, role };
    const rowData = formatHourTrackerData(task.scopes, loggedInUser);
    return {
        taskId: task.id,
        scopes: task.scopes,
        rowData,
        scopeList: getScopeList(task.scopes),
        loggedInUser
    }
}

export const HourTrackerTable = connect(mapStateToProps)(HourTrackerTableImpl);
