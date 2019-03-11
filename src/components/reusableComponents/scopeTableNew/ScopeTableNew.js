import { Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { EmployeeModel } from '../../../model/AppModels/EmployeeModel';
import { UtilModel } from '../../../model/AppModels/UtilModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { UserModel } from '../../../model/UserModel';
import { updateScope, updateScopeHighlightService } from '../../../service/scopeService';
import { renameProjectFolderOnFTP } from '../../../service/TaskService';
import { isValidHours, sortEmployee } from '../../../utils/common';
import { FIELDS } from '../../../utils/constants/ScopeTableFields';
import { showFaliureNotification, showSuccessNotification, showWarningNotification } from '../../../utils/notifications';
import { updateScopeSortBy } from '../../../utils/promises/ScopePromises';
import { updateTask, updateTaskNew } from '../../../utils/promises/TaskPromises';
import {
    getFromLocalStorage,
    getSortedScopes,
    hasOnHoldSelectedScopesInvoice,
    isPriceEqualTotalBilled,
} from '../../../utils/sortUtil';
import Constant from '../../helpers/Constant';
import { PLPDataGrid } from '../PLPDataGrid';
import { ScopeNumberDropdown } from '../ScopeNumberDropdown';
import TaskGroupDropdown from '../TaskGroupDropdown';
import CostRenderer from './cellRenderers/CostRenderer';
import { CustomerTeamPopup } from './cellRenderers/CustomerTeamPopup';
import { DHCTeamPopup } from './cellRenderers/DhcTeamPopup';
import DueDateRenderer from './cellRenderers/DueDateRenderer';
import NoteRenderer from './cellRenderers/NoteRender';
import NumericEditor from './cellRenderers/NumericEditor';
import StateRenderer from './cellRenderers/StateRenderer';
import StatusRenderer from './cellRenderers/StatusRenderer';
import TeamDropDownRenderer from './cellRenderers/TeamDropDownRenderer';
import { getTaskPayload, scopeDataConvertor } from './ScopeTableUtils';

class ScopeTableNewImpl extends PLPPureComponent {

    openTaskPage = (scope) => {
        const data = UtilModel.getUtilsData();
        data.title = `${scope[FIELDS.JOB]} - ${scope[FIELDS.PROJECT]} - ${scope[FIELDS.CITY]}, ${scope[FIELDS.STATE]}`;
        data.taskId = scope.taskId;
        data.newTask = null;
        new UtilModel(data).$save();
    };

    handleColorChange = (value, data) => {
        const { userId, scopeId } = data;
        const scopeInstance = ScopeModel.getScopeId(scopeId);
        if (!scopeInstance) return;

        const { highlights } = scopeInstance.props;
        let highlight = highlights.find(item => item.user === userId);

        if (!value || (highlight && value === highlight.color)) {
            return;
        }
        if (!highlight) {
            highlight = {
                user: userId,
                color: value
            }
        } else {
            highlight.color = value;
        }
        updateScopeHighlightService(scopeId, highlight)
    };

    renderColorDropdown = (params) => <ScopeNumberDropdown
        handleColorChange={this.handleColorChange}
        params={params}
    />;

    openTaskRenderer = (params) => <Button onClick={() => this.openTaskPage(params.data)}> {params.value} </Button>;

    openHourTrackerRenderer = (params) => <Button onClick={() => this.props.openHourTrackerForm(params)}> {params.value} </Button>;

    // Update task fields
    updateTask = (payload, fieldName) => {
        return updateTaskNew(payload.id, payload).then(response => {
            showSuccessNotification(`Task ${fieldName} updated successfully.`);
            SelectedTaskDetailModel.updateTaskDescription(response, response.id)
        }).catch(() => showFaliureNotification(`Failed to update task ${fieldName}.`));
    };

    updateAllScopesForTask = ({ data }) => {
        const scopes = ScopeModel.list().map(item => item.props).filter(scope => scope.task.id === data.id);
        ScopeModel.saveAll(scopes.map(scope => new ScopeModel({ ...scope, task: data })));
    };

    // returns payload object for updating scope urgent and non urgent hours depending on the logged in user role in scope
    updateHours = (value, field, { id, loggedInUserId, scopeTeam, task }) => {
        let engineerUser = scopeTeam.engineerDetails;
        let managerUser = scopeTeam.managerDetails;
        let drafterUser = scopeTeam.drafterDetails;

        if (task.isFromTaskGroup && drafterUser.drafter && drafterUser.drafter._id === loggedInUserId) {
            drafterUser[field] = value;
            return {
                drafterDetails: drafterUser,
                id
            };
        }

        if ((engineerUser.engineer._id === loggedInUserId && managerUser.manager._id === loggedInUserId) || engineerUser.engineer._id === loggedInUserId) {
            engineerUser[field] = value;
            return {
                engineerDetails: engineerUser,
                id
            };
        }
        if (managerUser.manager._id === loggedInUserId) {
            managerUser[field] = value;
            return {
                managerDetails: managerUser,
                id
            };
        }
        if (drafterUser.drafter && drafterUser.drafter._id === loggedInUserId) {
            drafterUser[field] = value;
            return {
                drafterDetails: drafterUser,
                id
            };
        }
    };

    updateUandNUHours = async (newValue, scope, coldef) => {
        const fieldName = coldef.field === FIELDS.U_HRS ? 'Urgent hours' : 'Non-urgent hours';
        if (!isValidHours(newValue)) {
            showWarningNotification(`${fieldName} should be in the range of 0 to 1000 and must be integer.`);
            return ScopeModel.resetScope(scope.id);
        }
        const payload = this.updateHours(newValue, coldef.field, scope);
        updateScope(payload, fieldName, null, this.props.loggedInUserId);
    };

    updateTaskDetails = (oldValue, newValue, data, field) => {
        const updatingFieldName = field === FIELDS.PROJECT ? 'Project name' : field;
        if (!newValue || !newValue.length > 0) {
            return showWarningNotification(`${updatingFieldName} should not be empty.`);
        }
        const { oldFolderName, newFolderName, taskPayload } = getTaskPayload(oldValue, newValue, data, field);
        this.updateTask(taskPayload, updatingFieldName)
            .then(() => renameProjectFolderOnFTP(oldFolderName, newFolderName));
    };

    resetModelRefreshRow = (data, params, field, oldValue) => {
        params.node.data[field] = oldValue
        params.api.redrawRows({ rowNodes: [params.node] });
    }
    handleChange = (params) => {
        const { oldValue, newValue, colDef, data, node } = params
        if (oldValue == newValue) { // in case of numeric it is not equal 0 !== "0"
            return;
        }
        if (newValue === '') {
            // node.setDataValue(colDef.field, oldValue)
            showWarningNotification(`${colDef.field} cannot be empty.`);
            this.resetModelRefreshRow(data, params, colDef.field, oldValue)
            return;
        }
        let payload = {};
        switch (colDef.field) {

            case FIELDS.COST:
                if (newValue && !isNaN(newValue)) {
                    payload = {
                        price: newValue,
                        id: data.id
                    };
                    updateScope(payload, 'price');
                    return
                }
                showWarningNotification('Cost should be number')
                this.resetModelRefreshRow(data, params, colDef.field, oldValue)
                break;

            case FIELDS.SCOPE_NOTE:
                if (newValue.length <= 16) {
                    payload = {
                        note: newValue,
                        id: data.id
                    };
                    updateScope(payload, 'note');
                } else {
                    // reshre
                    showWarningNotification('Scope Note can not be greater than 16')
                    this.resetModelRefreshRow(data, params, colDef.field, oldValue)
                    return
                }
                break;

            case FIELDS.NU_HRS:
            case FIELDS.U_HRS:
                this.updateUandNUHours(newValue, data, colDef);
                break;

            case FIELDS.CITY:
            case FIELDS.STATE:
            case FIELDS.PROJECT:
                this.updateTaskDetails(oldValue, newValue, data, colDef.field);
                break;
        }
    };

    handleRowDrag = (event) => {
        console.log("row drag event", event)
        const loggedInUser_Id = this.props.loggedInUserId;
        const nextIndex = event.overIndex;
        const draggedRowData = event.node.data;
        let existingRecords = getFromLocalStorage();
        existingRecords = JSON.parse(existingRecords);
        const userSpecificData = existingRecords[loggedInUser_Id];
        const storedGroupIds = [...userSpecificData[this.props.groupId]];
        const otherRows = storedGroupIds.filter(id => id !== draggedRowData.id);
        otherRows.splice(nextIndex, 0, draggedRowData.id);

        const finalData = {
            ...existingRecords,
            [loggedInUser_Id]: {
                ...userSpecificData,
                [this.props.groupId]: otherRows
            }
        };
        localStorage.setItem(Constant.LOCALSTORAGE_KEY.MANUAL_SORT, JSON.stringify(finalData))
    };

    onGridReady = (params) => {
        this.props.onGridReady(params, this.props.groupId);
        this.gridApi = params.api;
    };

    handleSortChange = () => {
        let prevSort = this.props.scopesSortBy;
        const sortOption = this.gridApi.getSortModel();
        const nextsrt = sortOption[0]
        if (nextsrt) {
            const index = prevSort.findIndex(grp => grp.group === this.props.groupId);
            if (index !== -1) {
                prevSort[index] = { ...prevSort[index], group: this.props.groupId, ascending: nextsrt.sort === 'asc', sortBy: nextsrt.colId }
            } else {
                prevSort.push({ group: this.props.groupId, ascending: nextsrt.sort === 'asc', sortBy: nextsrt.colId })
            }
            const payload = { userId: this.props.user.id, scopesSortBy: prevSort }
            updateScopeSortBy(payload)
                .then(res => {
                    UserModel.updateCurrentUser(res.sortBy)
                })
                .catch(err => console.log("response", err))
        }
    }

    getRowNodeId = (data) => {
        return data.id;
    };

    onGridSizeChanged = (params) => {
        var gridWidth = document.getElementById("grid-wrapper").offsetWidth;
        var columnsToShow = [];
        var columnsToHide = [];
        var totalColsWidth = 0;
        var allColumns = params.columnApi.getAllColumns();
        for (var i = 0; i < allColumns.length; i++) {
            let column = allColumns[i];
            totalColsWidth += column.getMinWidth();
            if (totalColsWidth > gridWidth) {
                columnsToHide.push(column.colId);
            } else {
                columnsToShow.push(column.colId);
            }
        }
        if (columnsToHide.length === 0) {
            params.api.sizeColumnsToFit();
        }
    }

    render = () => <div id='grid-wrapper' className="scope-table-container">
        <div className="ag-theme-balham custom-grid-layout" >
            <PLPDataGrid
                onGridReady={this.onGridReady}
                onSortChanged={this.handleSortChange}
                columnDefs={this.props.header}
                rowData={this.props.scopes}
                domLayout='autoHeight'
                onCellValueChanged={this.handleChange}
                pagination={this.props.pagination}
                paginationPageSize={50}
                deltaRowDataMode
                showLoader={this.props.showLoader}
                enableCellChangeFlash={true}
                getRowNodeId={this.getRowNodeId}
                onRowDragLeave={this.handleRowDrag}
                onRowDragEnd={this.handleRowDrag}
                frameworkComponents={{
                    internalTeamDropdownRenderer: TeamDropDownRenderer,
                    customerTeamPopupRenderer: CustomerTeamPopup,
                    internalTeamPopupRenderer: DHCTeamPopup,
                    taskGroupRenderer: TaskGroupDropdown,
                    dueDateRenderer: DueDateRenderer,
                    openTaskRenderer: this.openTaskRenderer,
                    dueDateDisabledRenderer: this.dueDateDisabledRenderer,
                    numericEditor: NumericEditor,
                    statusRenderer: StatusRenderer,
                    stateRenderer: StateRenderer,
                    costRenderer: CostRenderer,
                    colorDropdown: this.renderColorDropdown,
                    openHourTrackerRenderer: this.openHourTrackerRenderer,
                    noteRender: NoteRenderer
                }}
                onGridSizeChanged={this.onGridSizeChanged}
            />
        </div >
    </div>
}

function mapStateToProps(state, ownProps) {
    const user = ownProps.user || UserModel.last().props;
    const loggedInUserId = user._id;
    const loggedInUserRoleId = user.role.id;
    const loggedInUserRoleName = user.role.name;
    let sortScopes = ScopeModel.list()
        .filter(({ props }) =>
            !props.isArchived &&
            (props[`${ownProps.selector}`] && props[`${ownProps.selector}`]._id === ownProps.groupId) &&
            (props.managerDetails.manager._id === loggedInUserId ||
                props.engineerDetails.engineer._id === loggedInUserId ||
                (props.drafterDetails && props.drafterDetails.drafter && props.drafterDetails.drafter._id === loggedInUserId) ||
                loggedInUserRoleName === 'Customer' ||
                ownProps.parent === 'customerPage' ||
                (ownProps.selector === 'invoiceType' && loggedInUserRoleName === 'Admin/AP') ||
                ownProps.isUsingGenericSearch
            )
        );


    if (ownProps.selector === 'invoiceType') {
        // Check group is completed and the invoice of the listed scope is not on hold and price > total billed
        if (ownProps.action === 1) {
            // to remove invoice if group has been changed for a task in completed not invoiced section
            sortScopes = sortScopes.filter(({ props }) => {
                const isPriceGreater = isPriceEqualTotalBilled(props);
                return props.group.id === Constant.TASK_GROUP_ID.COMPLETED_PROJECTS && isPriceGreater;
            })
        } else {
            // Check here scopes of other groups and the invoice of selected scope is on hold
            // remove scopes that are irrespective of any group and not on hold
            sortScopes = sortScopes.filter(({ props }) => {
                return hasOnHoldSelectedScopesInvoice(props);
            });
        }
    }
    sortScopes = ownProps.manualSort && getSortedScopes(sortScopes, ownProps.groupId, loggedInUserId) || sortScopes.map(scope => scope.props)
    // sortScopes = sortScopes.map(scope => scope.props)
    const scopes = sortScopes.map(scope => scopeDataConvertor(scope, ownProps.header, loggedInUserId, loggedInUserRoleId, loggedInUserRoleName));
    return {
        loggedInUserId,
        scopes,
        employees: sortEmployee(EmployeeModel.list().map(item => item.props))
    };
}

ScopeTableNewImpl.propTypes = {
    onGridReady: PropTypes.func,
    selector: PropTypes.string,
    pagination: PropTypes.bool
};

ScopeTableNewImpl.defaultProps = {
    onGridReady: () => { },
    selector: 'group',
    pagination: false
};

export const ScopeTableNew = connect(mapStateToProps)(ScopeTableNewImpl);
