import './HomePageTables.scss';

import { Button, Collapse, DatePicker, Row, Switch } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import React from 'react';
import isEqual from 'react-fast-compare';
import { connect } from 'react-redux';

import { AddIcon } from '../../../baseComponents/button';
import CustomRangePicker from '../../../baseComponents/CustomRangePicker';
import { PLPPureComponent } from '../../../baseComponents/importer';
import { AdvanceFilter } from '../../../model/AppModels/FilterModel';
import { HourTrackerModel } from '../../../model/AppModels/HourTrackerModel';
import { UtilModel } from '../../../model/AppModels/UtilModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { SelectedUserModel } from '../../../model/TaskModels/SelectedUserModel';
import { UserModel } from '../../../model/UserModel';
import { getGroupTypes } from '../../../utils/common';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';
import { FIELDS } from '../../../utils/constants/ScopeTableFields';
import { homeTableHeader } from '../../../utils/constants/ScopeTableHeaders';
import { getDefaultDateRangeForGroups, isSameDate, sortByDate } from '../../../utils/DateUtils';
import { getUserScopesByGroup } from '../../../utils/promises/UserPromises';
import ScopeFilter from '../../filter/scopeFilter';
import Constants from '../../helpers/Constant';
import { AddHourtrackerForm } from '../../hourTracker/addHour';
import { ScopeTableNew } from '../../reusableComponents/scopeTableNew/ScopeTableNew';
import CompletedPageTable from '../completedScopePage/container/CompletedScopeContainer';

const { RangePicker } = DatePicker;
// import { homeTableHeader } from '../../../utils/constants/ScopeTableHeaders';

let sortFields = homeTableHeader.filter(hd => ![FIELDS.TG, FIELDS.TEAM, FIELDS.SCOPE_NOTE, FIELDS.CSA, FIELDS.PO, FIELDS.CUST_INV, FIELDS.CALC].includes(hd.field)).map(hd => hd.field)
// sortFields = [...sortFields, FIELDS.U_HRS, FIELDS.NU_HRS]

class HomePageTables extends PLPPureComponent {

    constructor(props) {
        super(props);
        const activeTabs = localStorage.getItem('activeTabs');
        const manualSort = localStorage.getItem('manualSort');
        this.state = {
            // isOpenRangePicker: [
            //     { status: false, groupId: Constants.TASK_GROUP_TITLE_ID.ACTIVE_PROJECTS._ID, },
            //     { status: false, groupId: Constants.TASK_GROUP_TITLE_ID.ON_HOLD._ID, },
            //     { status: false, groupId: Constants.TASK_GROUP_TITLE_ID.TASKS._ID, },
            //     { status: false, groupId: Constants.TASK_GROUP_TITLE_ID.BIDS._ID, }

            // ],
            isAdvanceSearchApplied: false,
            activeTabs: activeTabs && activeTabs.split(',') || ['0'],
            taskId: null,
            title: null,
            newTask: null,
            showAddHourTrackerForm: false,          // for updating hour tracker
            manualSort,
            showLoader: true,
            dateRange: [
                {
                    groupId: Constants.TASK_GROUP_TITLE_ID.ACTIVE_PROJECTS._ID,
                    value: getDefaultDateRangeForGroups(2),
                    mode: ['year', 'year']
                },
                {
                    groupId: Constants.TASK_GROUP_TITLE_ID.ON_HOLD._ID,
                    value: getDefaultDateRangeForGroups(),
                    mode: ['year', 'year']
                },
                {
                    groupId: Constants.TASK_GROUP_TITLE_ID.TASKS._ID,
                    value: getDefaultDateRangeForGroups(),
                    mode: ['year', 'year']
                },
                {
                    groupId: Constants.TASK_GROUP_TITLE_ID.BIDS._ID,
                    value: getDefaultDateRangeForGroups(0),
                    mode: ['year', 'year']
                }
            ],
            groupLoaders: {
                [Constants.TASK_GROUP_TITLE_ID.ON_HOLD._ID]: false,
                [Constants.TASK_GROUP_TITLE_ID.TASKS._ID]: false,
                [Constants.TASK_GROUP_TITLE_ID.BIDS._ID]: false,
            }
        }
        this.params = null
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.advanceFilters && !isEqual(nextProps.advanceFilters, this.props.advanceFilters) && this.props.advanceFilters && this.props.advanceFilters.applyFilter && nextProps.advanceFilters.applyFilter == false) {
            this.getScopes();
        }
    }

    getScopes() {
        UtilModel.updateLoaderValue(true);
        ScopeModel.deleteAll();
        Promise.all(getGroupTypes().map(item => {
            const groupDateRange = this.state.dateRange.find(range => range.groupId === item.id);
            const startYear = moment(groupDateRange.value[0]).year();
            const endYear = moment(groupDateRange.value[1]).year();
            return getUserScopesByGroup(this.props.loggedInUserId, item.id, startYear, endYear)
        }))
            .then(response => {
                let scopes = response.map(res => res.data);
                ScopeModel.saveAll(scopes.reduce((scopeList, scope) => [...scopeList, ...scope]).map(scope => new ScopeModel(scope)));
                this.handleLoader(false)
                this.setState({ showLoader: false });
            })
            .catch(e => {
                console.log(e);
                this.setState({ showLoader: false });
                this.handleLoader(false)
            })
    }

    componentWillUnmount() {
        ScopeModel.deleteAll();
        HourTrackerModel.deleteAll();
        AdvanceFilter.removeFilter();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.showTableLoader !== this.props.showTableLoader) {
            this.setState({ showLoader: this.props.showTableLoader });
        }
        if (prevProps.manualSortDisabled !== this.props.manualSortDisabled) {
            this.handleSorting();
        }
        if (this.props.loggedInUserId !== prevProps.loggedInUserId) {
            this.getScopes();
        }
    }

    sortedScopesFromSortedIds(sortedScopeIds = [], scopes = []) {
        if (!sortedScopeIds.length) return scopes;
        scopes = scopes.reduce((scopeList, scope) => [...scopeList, ...scope]);
        return sortedScopeIds.map(item => {
            const scope = scopes.find(scope => scope.id === item);
            return { ...scope, color: Constants.SCOPE_HIGHLIGHT_COLOR.RED }
        })
    }

    handleLoader(flag) {
        UtilModel.updateLoaderValue(flag)
    }

    componentWillMount() {
        this.handleLoader(true)
        this.getScopes()
    }

    populateSelectedGroupScopes = async (groupId) => {
        this.toggleLoaderOnSelectedGroup(groupId, true);
        const groupDateRange = { ...this.state.dateRange.find(range => range.groupId === groupId) };
        const startYear = moment(groupDateRange.value[0]).year();
        const endYear = moment(groupDateRange.value[1]).year();
        const response = await getUserScopesByGroup(this.props.loggedInUserId, groupId, startYear, endYear);
        ScopeModel.deleteSelectedGroupsScopes(groupId);
        if (response.data.length) {
            ScopeModel.saveAll(response.data.map(scope => new ScopeModel(scope)));
        }
        this.toggleLoaderOnSelectedGroup(groupId, false);
    }

    onTaskAdd = (e, group) => {
        e.stopPropagation();
        const data = UtilModel.getUtilsData();
        data.taskId = null;
        data.title = null;
        data.newTask = group;
        new UtilModel(data).$save();
        // this.props.updateAppState({ newTask: group });
        // this.setState({ newTask: group });
    };

    handleCollapaseChange = (incomingKey) => {
        let prevActive = this.state.activeTabs.map(tabNumber => parseInt(tabNumber));
        const index = prevActive.findIndex(tabKey => tabKey == incomingKey);
        if (index === -1) {
            prevActive.push(incomingKey)
            this.setState({ activeTabs: prevActive }, () => localStorage.setItem('activeTabs', prevActive));
        } else {
            prevActive = prevActive.filter(key => incomingKey !== key); //bcoz index is number and active tabs are string from localstorage
            this.setState({ activeTabs: prevActive }, () => localStorage.setItem('activeTabs', prevActive));
        }
    };

    onGridReady = (params, groupId) => {
        this.setState({
            [`gridAPI${groupId}`]: params
        });
        this.handleSorting();
    };

    handleSorting = () => {
        Constants.TASK_GROUP_ARRAY.map(taskGroupID => {
            let params = this.state[`gridAPI${taskGroupID}`];
            if (!params) {
                return;
            }
            if ((this.state.manualSort == true || this.state.manualSort == 'true') && !this.props.manualSortDisabled) {
                sortFields.forEach((def, index) => {
                    let col = params.columnApi.getColumn(def);
                    let colDef = col.getColDef();
                    colDef.suppressSorting = true;
                })
                let col = params.columnApi.getColumn('tg');
                let colDef = col.getColDef();
                colDef.rowDrag = true;
                params.api.setSortModel(null);
                params.api.setColumnDefs(params.columnApi.columnController.columnDefs)
            } else {
                const prevSortArray = this.getPrevSortedData(taskGroupID)
                sortFields.forEach((def, index) => {
                    let col = params.columnApi.getColumn(def);
                    let colDef = col.getColDef();
                    colDef.suppressSorting = false;
                })
                let col = params.columnApi.getColumn('tg');
                let colDef = col.getColDef();
                colDef.rowDrag = false;
                params.api.setSortModel(prevSortArray);
            }
            params.api.refreshHeader();
        });
    }

    getPrevSortedData = (taskGroupID) => {
        let prevSortArray = []
        const isSortedPrev = this.props.scopesSortBy.filter(groups => groups.group == taskGroupID);
        isSortedPrev.map(scope => {
            const sort = scope.ascending ? 'asc' : 'desc';

            switch (scope.sortBy) {
                case 'dueDate':
                case FIELDS.DUE_DATE:
                    prevSortArray.push({ colId: FIELDS.DUE_DATE, sort })
                    break;
                case 'dueDateWithStatus':
                    prevSortArray.push({ colId: FIELDS.DUE_DATE_WITH_STATUS, sort })
                    break;
                case 'scopeColor':
                case FIELDS.SCOPE:
                    prevSortArray.push({ colId: FIELDS.SCOPE, sort })
                    break;
                case 'projectName':
                    prevSortArray.push({ colId: FIELDS.PROJECT, sort })
                    break;
                case 'invoiceNumber':
                    prevSortArray.push({ colId: FIELDS.CUST_INV, sort })
                    break;
                case 'contractor':
                    prevSortArray.push({ colId: FIELDS.CONTR, sort })
                    break;
                case 'city':
                    prevSortArray.push({ colId: FIELDS.CITY, sort })
                    break;
                case 'state':
                    prevSortArray.push({ colId: FIELDS.STATE, sort })
                    break;
                case 'engineerDetails.status':
                case FIELDS.STATUS:
                case 'drafterDetails.status':
                    prevSortArray.push({ colId: FIELDS.STATUS, sort })
                    break;
                case 'engineerDetails.urgentHours':
                case FIELDS.U_HRS:
                case 'drafterDetails.urgentHours':
                    prevSortArray.push({ colId: FIELDS.U_HRS, sort })
                    break;
                case 'engineerDetails.nonUrgentHours':
                case 'drafterDetails.nonUrgentHours':
                case FIELDS.NU_HRS:
                    prevSortArray.push({ colId: FIELDS.NU_HRS, sort })
                    break;
                case 'price':
                case 'cost':
                    prevSortArray.push({ colId: FIELDS.COST, sort })
                    break;
                case 'jobNumber':
                case FIELDS.JOB:
                    prevSortArray.push({ colId: FIELDS.JOB, sort })
                    break
            }
        })
        return prevSortArray
    }

    handlePanelChange = (value, mode, groupId) => {
        const dateRange = cloneDeep(this.state.dateRange);
        const index = dateRange.findIndex(range => range.groupId === groupId);
        dateRange[index].value = value;
        this.setState({ dateRange });
    }

    disableRange = (dates, partial) => {
        return moment(dates[1]).isAfter(dates[0]);
    }

    toggleLoaderOnSelectedGroup = (groupId, value) => {
        const groupLoaders = { ...this.state.groupLoaders };
        groupLoaders[groupId] = value;
        this.setState({ groupLoaders });
    }

    resetScopes = async (groupId) => {
        // this.toggleLoaderOnSelectedGroup(groupId, true);
        const dateRange = [...this.state.dateRange.map(range => { return { ...range } })];
        const index = dateRange.findIndex(range => range.groupId === groupId);
        dateRange[index].value = getDefaultDateRangeForGroups(index === 3 ? 0 : 1);
        this.setState({ dateRange });
        const startYear = moment(dateRange[index].value[0]).year();
        const endYear = moment(dateRange[index].value[1]).year();
        const response = await getUserScopesByGroup(this.props.loggedInUserId, groupId, startYear, endYear);
        ScopeModel.deleteSelectedGroupsScopes(groupId);
        if (response.data.length) {
            ScopeModel.saveAll(response.data.map(scope => new ScopeModel(scope)));
        }
        // this.toggleLoaderOnSelectedGroup(groupId, false);
    }

    renderAddIcon = (group) => {
        const roleName = this.props.userRole.name;
        const hasAccess = group.id === Constants.TASK_GROUP__ID.TASKS && ['Manager', 'Engineer', 'Admin', 'Admin/AP'].includes(roleName) || ['Manager', 'Engineer'].includes(roleName)
        const dateRange = this.state.dateRange;
        const index = dateRange.findIndex(range => range.groupId === group.id);
        return <Row type="flex" style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="accordian--title">
                <h5 className="text-center">{group.title}

                </h5>
                {hasAccess && <AddIcon style={{ marginLeft: 5 }} className="color-primary icon-large"
                    onClick={(e) => this.onTaskAdd(e, group)} />
                }
            </div>
            {
                group.id !== Constants.TASK_GROUP_TITLE_ID.ACTIVE_PROJECTS._ID && !this.state.isAdvanceSearchApplied &&
                <div className='range-picker-wrapper' onClick={(event) => event.stopPropagation()}>
                    <CustomRangePicker
                        value={dateRange[index].value}
                        mode={dateRange[index].mode}
                        format='YYYY'
                        onPanelChange={(value, mode) => this.handlePanelChange(value, mode, group.id)}
                    />
                    <div className='range-picker-buttons-wrapper'>
                        <Button style={changeSubmitButtonStyle(this.state.groupLoaders[group.id])} type='primary' onClick={() => this.populateSelectedGroupScopes(group.id)}>Populate</Button>
                        <Button style={{ marginLeft: 10 }} onClick={() => this.resetScopes(group.id)}>Reset</Button>
                    </div>
                </div>
            }
        </Row>
    };

    renderScopeTabs = () => getGroupTypes().map((group, index) => <Collapse key={group.id} onChange={() => this.handleCollapaseChange(index)} defaultActiveKey={this.state.activeTabs} >
        <Collapse.Panel key={index} header={this.renderAddIcon(group)}>
            <ScopeTableNew
                key={group.id}
                manualSort={this.state.manualSort}
                groupId={group.id}
                showLoader={this.state.showLoader || this.state.groupLoaders[group.id]}
                scopesSortBy={this.props.scopesSortBy}
                selector='group'
                onGridReady={this.onGridReady}
                header={homeTableHeader}
                user={this.props.selectedUser}
                openHourTrackerForm={this.openHourTrackerForm}
                isUsingGenericSearch={this.props.advanceFilters}
            />
        </Collapse.Panel>
    </Collapse>
    );

    renderHourForm = () => <AddHourtrackerForm
        showScope showTask disableTask
        disableScope focusHours={true}
        togglePopup={this.toggleHourTrackerForm}
        selectedScope={this.state.selectedScope}
        loggedInUserId={this.props.loggedInUserId}
        hourtracker={this.state.hourtracker}
        disabledDatePicker
    />;

    toggleHourTrackerForm = () => {
        this.setState({ selectedScope: null, showAddHourTrackerForm: false })
    };

    handleCongratulationsPopup = (val) => {
        this.props.updateAppState({ showCongratulationsPopup: val });
    };

    openHourTrackerForm = ({ data }) => {
        const scopeInstance = ScopeModel.getScopeId(data.id);
        const hourTrackers = scopeInstance.props.hourTrackers.filter(hour => {
            if (hour.employee && hour.employee._id === this.props.loggedInUserId) {
                return hour
            }
        })
        const sameDateHourTrackers = sortByDate(hourTrackers).filter(item => isSameDate(item.date)); // get latested added
        const hourtracker = sameDateHourTrackers && sameDateHourTrackers.pop() || undefined
        this.setState({
            showAddHourTrackerForm: true,
            selectedScope: data,
            hourtracker
        });
    };

    handleSwitchChange = (value, field) => {
        if (field === 'manualSort') {
            this.setState({ manualSort: value }, () => {
                localStorage.setItem('manualSort', value);
                this.handleSorting()
            });
        } else {
            this.setState({ [field]: value }, () => this.props.advanceFilters && this.props.advanceFilters.applyFilter && AdvanceFilter.removeFilter());
        }
    }

    render = () => <div className='home-container'>
        {this.state.showAddHourTrackerForm && this.renderHourForm()}
        <div className="manual_sort_checkbox">
            <Switch checked={this.state.isAdvanceSearchApplied} onChange={(value) => this.handleSwitchChange(value, 'isAdvanceSearchApplied')} /> Advanced Search
            <Switch style={{ marginLeft: 12 }} disabled={this.props.manualSortDisabled} checked={this.state.manualSort == true || this.state.manualSort == 'true'} onChange={(value) => this.handleSwitchChange(value, 'manualSort')} /> Manual Sorting
        </div>
        {this.state.isAdvanceSearchApplied && <ScopeFilter isAdvanceSearchApplied={this.state.isAdvanceSearchApplied} isLoading={this.state.showLoader} />}
        {this.renderScopeTabs()}
        {this.props.advanceFilters && this.props.advanceFilters.applyFilter && <CompletedPageTable fromHomePage={true} /> }
    </div>;
}

function mapStateToProps() {
    const user = UserModel.last().props;
    const selectedUserInstance = SelectedUserModel.last();
    let selectedUser = selectedUserInstance && selectedUserInstance.props || user;
    const { showTableLoader, isManualSortDisabled } = UtilModel.getUtilsData();
    const filters = AdvanceFilter.last();

    return {
        loggedInUserId: selectedUser._id,
        userRole: user.role,
        selectedUser: { _id: selectedUser._id, role: selectedUser.role, id: selectedUser.id },
        scopesSortBy: user && user.scopesSortBy || [],
        showTableLoader,
        manualSortDisabled: isManualSortDisabled,
        advanceFilters: filters && filters.props || undefined,
    };
}

export default connect(mapStateToProps)(HomePageTables);
