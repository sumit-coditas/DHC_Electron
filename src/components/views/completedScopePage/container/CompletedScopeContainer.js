import './CompletedScopeContainer.scss';

import { Button, Collapse, Row } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import isEqual from 'react-fast-compare';
import { connect } from 'react-redux';

import ReportAction from '../../../../actions/ReportAction';
import CustomRangePicker from '../../../../baseComponents/CustomRangePicker';
import { AddIcon } from '../../../../baseComponents/importer';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel';
import { AdvanceFilter } from '../../../../model/AppModels/FilterModel';
import { UtilModel } from '../../../../model/AppModels/UtilModel';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { UserModel } from '../../../../model/UserModel';
import ReportStore from '../../../../stores/ReportStore';
import { changeSubmitButtonStyle } from '../../../../utils/changeBackgroundOfSubmit';
import { sortEmployee } from '../../../../utils/common';
import { completeTableHeader } from '../../../../utils/constants/ScopeTableHeaders';
import { getDefaultDateRangeForGroups } from '../../../../utils/DateUtils';
import { showFaliureNotification } from '../../../../utils/notifications';
import { getUserScopesByGroup } from '../../../../utils/promises/UserPromises';
import ScopesFilter from '../../../filter/scopeFilter';
import Constant from '../../../helpers/Constant';
import WriteAccess from '../../../helpers/WriteAccess.js';
import ReportTableContainer from '../../../reportTable/Container/ReportTableContainer.js';
import { ScopeTableNew } from '../../../reusableComponents/scopeTableNew/ScopeTableNew';
import UserDropDown from '../../../userDropDown/';
import { reportTypes, strings } from '../constants';

class CompletedScopeContainer extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            taskId: null,
            userId: props.userId,
            showTaskForm: false,
            populateLoader: false,
            showLoader: props.fromHomePage ? false : true,
            dateRange: {
                value: getDefaultDateRangeForGroups(0),
                mode: ['year', 'year']
            },
        };
        if (!props.fromHomePage) {
            UtilModel.updateLoaderValue(true)
        }
    }

    componentDidMount() {
        this.getScopes(this.props.userId, moment(this.state.dateRange.value[0]).year(), moment(this.state.dateRange.value[1]));
    }
    componentWillUnmount() {
        ScopeModel.deleteAll();
        AdvanceFilter.removeFilter();
    }

    getScopes = (userId, fromYear, toYear) => {
        if (this.props.fromHomePage) return;
        console.log("fetching completed scopes")
        ScopeModel.deleteAll();
        getUserScopesByGroup(userId, Constant.TASK_GROUP__ID.COMPLETED_PROJECTS, fromYear, toYear)
            .then(({ data }) => {
                ScopeModel.saveAll(data.map(scope => new ScopeModel(scope)));
                this.setState({ showLoader: false });
                UtilModel.updateLoaderValue(false)
            }).catch(e => {
                console.log(e);
                this.setState({ showLoader: false });
                UtilModel.updateLoaderValue(false);
                showFaliureNotification(strings.errorMessage);
            })
    };

    getReportTable = () => {
        if (this.props.userRole.name !== 'Manager') {
            reportTypes.push({ key: '1', text: strings.totalHours, value: 'total_hours_report' });
        }
        return (
            <ReportTableContainer
                reportTypes={reportTypes}
            />
        );
    };

    onTaskAdd = (e, group) => {
        e.stopPropagation();
        const data = UtilModel.getUtilsData();
        data.taskId = null;
        data.title = null;
        data.newTask = group;
        new UtilModel(data).$save();
        this.setState({ showTaskForm: !this.state.showTaskForm });
    };

    handlePanelChange = (value) => {
        const dateRange = { ...this.state.dateRange };
        dateRange.value = value;
        this.setState({ dateRange });
    };

    resetScopes = async () => {
        const dateRange = { ...this.state.dateRange };
        dateRange.value = getDefaultDateRangeForGroups(0);
        this.setState({ dateRange, showLoader: true });
        const startYear = moment(dateRange.startValue).year();
        const endYear = moment(dateRange.endValue).year();
        ScopeModel.deleteSelectedGroupsScopes(Constant.TASK_GROUP_TITLE_ID.COMPLETED_PROJECTS._ID);
        const response = await getUserScopesByGroup(this.state.userId, Constant.TASK_GROUP_TITLE_ID.COMPLETED_PROJECTS._ID, startYear, endYear);
        if (response.data.length) {
            ScopeModel.saveAll(response.data.map(scope => new ScopeModel(scope)));
        }
        this.setState({ showLoader: false });
    };

    populateSelectedGroupScopes = async () => {
        UtilModel.updateLoaderValue(true)
        this.setState({ showLoader: true, populateLoader: true });
        const groupDateRange = { ...this.state.dateRange };
        const startYear = moment(groupDateRange.value[0]).year();
        const endYear = moment(groupDateRange.value[1]).year();
        // const startYear = moment(groupDateRange.startValue).year();
        // const endYear = moment(groupDateRange.endValue).year();
        const response = await getUserScopesByGroup(this.state.userId, Constant.TASK_GROUP_TITLE_ID.COMPLETED_PROJECTS._ID, startYear, endYear);
        ScopeModel.deleteSelectedGroupsScopes(Constant.TASK_GROUP_TITLE_ID.COMPLETED_PROJECTS._ID);
        if (response.data.length) {
            ScopeModel.saveAll(response.data.map(scope => new ScopeModel(scope)));
        }
        UtilModel.updateLoaderValue(false)
        this.setState({ showLoader: false, populateLoader: false });
    };

    renderAddIcon = (group) => {
        const roleName = this.props.userRole.name;
        const hasAcceess = ['Manager', 'Engineer'].includes(roleName);
        const dateRange = this.state.dateRange;
        const { advanceFilters } = this.props;
        return <Row type="flex" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div className="accordian--title margin-top5">
                <h5>{group.title}</h5>
                {hasAcceess && <AddIcon style={{ marginLeft: 5 }} className="color-primary icon-large"
                    onClick={(e) => this.onTaskAdd(e, group)} />
                }
            </div>
            {
                !this.props.fromHomePage && advanceFilters && advanceFilters.isPanelCollapsed && <div className='range-picker-wrapper' onClick={(event) => event.stopPropagation()}>
                    <CustomRangePicker
                        value={dateRange.value}
                        mode={dateRange.mode}
                        format='YYYY'
                        onPanelChange={(value) => this.handlePanelChange(value)}
                    />
                    <div className='range-picker-buttons-wrapper'>
                        <Button type='primary' style={changeSubmitButtonStyle(this.state.populateLoader)} onClick={this.populateSelectedGroupScopes}>Populate</Button>
                        <Button style={{ marginLeft: 10 }} onClick={this.resetScopes}>Reset</Button>
                    </div>
                </div>
            }
        </Row>
    };

    getCompletedScopeTable = () => <Collapse defaultActiveKey={["0"]}>
        <Collapse.Panel
            key={"0"}
            header={this.renderAddIcon({ id: '5907701d219b330011d09bca', title: 'Completed Projects' })}
        >
            <ScopeTableNew
                groupId={Constant.TASK_GROUP__ID.COMPLETED_PROJECTS}
                selector='group'
                showLoader={this.state.showLoader}
                header={completeTableHeader}
                user={this.state.userId ? this.props.employees.find(user => user._id === this.state.userId) : this.props.employees.find(user => user._id === this.props.userId)}
                pagination={this.props.fromHomePage ? false : true}
                isUsingGenericSearch={this.props.advanceFilters}
            // openTaskPage={this.openTaskPage}
            />
        </Collapse.Panel>
    </Collapse>;

    closeTaskModal = () => {
        this.setState({
            taskId: null,
            title: ''
        });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.advanceFilters && !isEqual(nextProps.advanceFilters, this.props.advanceFilters) && nextProps.advanceFilters.applyFilter == false) {
            this.getScopes(this.props.userId, moment(this.state.dateRange.value[0]).year(), moment(this.state.dateRange.value[1]));
        }
    }

    handleUserChange = (userId) => {
        this.setState({ userId, showLoader: true }, () => {
            ReportAction.setFilter({ userID: userId });
            ReportAction.getReport(ReportStore.getState().filters);
            this.getScopes(this.state.userId, moment(this.state.dateRange.value[0]).year(), moment(this.state.dateRange.value[1]).year());
        });
    };

    render() {
        if (this.props.fromHomePage) {
            return this.getCompletedScopeTable()
        }
        return (
            <div className='main-page_wrapper compleate-scope-container'>
                {this.state.taskId && this.getTaskModal()}
                {this.props.userRole.id === Constant.ROLE_ID.MANAGER &&
                    <div className='user-search-container'>
                        <lable>Select User </lable>
                        <UserDropDown handleChange={this.handleUserChange} />
                    </div>
                }
                {WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_TASK.NAME) &&
                    <div className='page-wrapper report-table-container'>
                        {this.getReportTable()}
                    </div>
                }
                {
                    <div style={{ marginBottom: 20 }}>
                        <ScopesFilter isCompletedScopes={true} isLoading={this.state.showLoader} />
                    </div>
                }
                <div className='page-wrapper completed-scope-table-container'>
                    {this.getCompletedScopeTable()}
                </div>
                {/* {this.state.showTaskForm && this.renderTaskFormModal()} */}
            </div>
        )
    }
}

function mapStateToProps() {
    const user = UserModel.last().props;
    const filters = AdvanceFilter.last();
    return {
        userId: user._id,
        userRole: user.role,
        employees: sortEmployee(EmployeeModel.list().map(item => item.props)),
        advanceFilters: filters && filters.props || undefined,
    };
}

export default connect(mapStateToProps)(CompletedScopeContainer);
