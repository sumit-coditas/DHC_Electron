import './Timesheet.scss';

import { Dropdown, Icon, Input, Menu, Switch, Tooltip } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setLoading, setSuccess } from '../../../actions/loadingActions';
import { PLPDatePicker } from '../../../baseComponents/importer';
import { PLPInput } from '../../../baseComponents/PLPInput';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { Select } from '../../../baseComponents/Select';
import { EmployeeModel } from '../../../model/AppModels/EmployeeModel';
import { HourTrackerModel } from '../../../model/AppModels/HourTrackerModel';
import { UserModel } from '../../../model/UserModel';
import { DrafterAdminModal } from '../../../model/payDayModels/DrafterAdminModal';
import { showConfirmationModal } from '../../../utils/cofirmationModal';
import { formatDate, getTaskNumber, sortEmployee } from '../../../utils/common';
import { PLPDATE_FORMAT } from '../../../utils/constant';
import { timesheetTableHeaders } from '../../../utils/constants/ScopeTableHeaders';
import { sortByDate } from '../../../utils/DateUtils';
import { getUsersHourtrackers } from '../../../utils/promises/timesheetPromises';
import { getTodaysLoggedHoursOfUser } from '../../../utils/promises/UserPromises';
import Constant from '../../helpers/Constant.js';
import { AddHourtrackerForm } from '../../hourTracker/addHour';
import { HourInput } from '../../hourTracker/wrapperComponents';
import { Async } from '../../reusableComponents/Async';
import { ErrorPage } from '../../reusableComponents/ErrorPage';
import { Loader } from '../../reusableComponents/Loader';
import MemberProfilePic from '../../reusableComponents/MemberProfilePic';
import { PLPDataGrid } from '../../reusableComponents/PLPDataGrid';
import { deleteHourRecord, updateHourtrackerCall } from '../../TimesheetPopUps/service';
import FullWidthCellRenderer from './fullWidthCellRenderer';
import { MultipleHourtrackerModal } from './MultipleHourTracker';

// import MultipleHourTracker from '../../reusableComponents/MultipleHourTracker.js';
class TimesheetTableImpl extends PLPPureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      selectedUser: {
        text: `${props.loggedInUser.firstName} ${props.loggedInUser.lastName}`,
        key: props.loggedInUser._id,
        value: props.loggedInUser._id,
        role: { ...props.loggedInUser.role }
      },
      hourTrackerFirstYear: null,
      hourTrackerLastYear: null,
      yearOptions: [],
      dayView: true,
      isHourTrackerFormOpen: false,
      isMultipleHourTrackerOpen: false,
      isSortedByDate: true,
      sortPreference: 'desc'
    };
  }
  userImageRender = params => (
    <MemberProfilePic
      name={params.data.user.firstName + ' ' + params.data.user.lastName}
      image={params.data.user.picture || ''}
    />
  );

  handleCellChange = params => {
    const updatableHourTracker = {
      [params.colDef.field]: params.value,
      scopeID: params.data.scopeId,
      id: params.data.hourId,
      _id: params.data._id
    };
    this.onHourUpdateApiCall(updatableHourTracker);
  };

  onHourUpdateApiCall(hourTrackerToUpdate) {
    updateHourtrackerCall(hourTrackerToUpdate);
    if (hourTrackerToUpdate.hoursSpent) {
      // getTodaysLoggedHoursOfUser(this.props.loggedInUser._id);
    }
  }

  handleChange = (value, field, data) => {
    const updatableHourTracker = {
      [field]: value,
      id: data.hourId,
      _id: data._id
    };
    this.onHourUpdateApiCall(updatableHourTracker);
  };

  onCellValueChanged = (params) => {
        const { oldValue, newValue, colDef, data, node } = params;
        if (oldValue == newValue) {
            return;
        }
        let payload = {};
        switch (colDef.field) {

            case 'note':
                    payload = {
                        note: newValue,
                        id: data.hourId
                    };
                     this.onHourUpdateApiCall(payload);
                    return;
                break;

        }
    };

  hourInputRender = params => {
    return (
      <HourInput
        onBlur={value => this.handleChange(value, 'hoursSpent', params.data)}
        value={params.value}
        required
      />
    );
  };

  // disabledDate = value => value < moment().subtract(1, 'days');

  handleDuedateChange = (value, data) => {
    this.handleChange(value, 'date', data);
  };

  dateRender = params => {
    const { value, data } = params;
    return (
      <PLPDatePicker
        className='dueDatePicker'
        data={data}
        defaultValue={moment(value, PLPDATE_FORMAT)}
        format={PLPDATE_FORMAT}
        onChange={this.handleDuedateChange}
        autoFocus={false}
      />
    );
  };

  promise = async () => {
    const payload = { userId: this.state.selectedUser.value, month: moment().month(), year: moment().year(), needYear: true };
    const response = await getUsersHourtrackers(payload);
    this.setTimesheetState(response, payload);
  };

  setTimesheetState(response, payload) {
    if (this.state && this.state.yearOptions.length && this.props.loggedInUser._id === payload.userId) {
      this.setState({ selectedYear: payload.year, selectedMonth: payload.month });
    } else {
      const hourTrackerFirstYear = moment(response.oldestDate).year();
      const hourTrackerLastYear = moment(response.latestDate).year();
      const yearOptions = [];
      let i;
      for (i = hourTrackerFirstYear; i <= hourTrackerLastYear; i++) {
        yearOptions.push({ text: i, value: i });
      }
      this.setState({ hourTrackerFirstYear, hourTrackerLastYear, selectedYear: payload.year, selectedMonth: payload.month, yearOptions });
    }
  }

  handleNoteChange = (e, params) => {
    // e.stopPropagation();
    e.preventDefault();
    const newparams = { ...params, value: e.target.value };
    this.handleCellChange(newparams);
  };

  handleDelete = data => {
    const payload = { scopeId: data.scopeId, _id: data._id, hourId: data.hourId, taskId: '' }; // passing blank taskID
    const title = 'Delete  Hour Record ?',
      content = `Are you sure you want to delete Hour ? This action will delete hour from scope.`;
    showConfirmationModal(title, content, async () => {
      deleteHourRecord(payload);
      // getTodaysLoggedHoursOfUser(this.props.loggedInUser._id);
    });
  };

  renderEditInputBox = params => {
    return (
      <Input defaultValue={params.value} onBlur={e => this.handleNoteChange(e, params)} suffix={<Icon type='edit' />} />
    );
  };

  getTimesheetDetailsOfUser = async payload => {
    setLoading('Timesheet');
    const response = await getUsersHourtrackers(payload);
    this.setTimesheetState(response, payload);
    setSuccess('Timesheet');
  };

  archiveIconRender = params =>
    params.data.isDeletable && (
      <Icon className='cursor-pointer' type='delete' onClick={() => this.handleDelete(params.data)} />
    );

  setSelectedYear = year => {
    const payload = { userId: this.state.selectedUser.value, month: this.state.selectedMonth, year: year, needYear: this.props.loggedInUser._id !== this.state.selectedUser.value };
    this.getTimesheetDetailsOfUser(payload);
  };

  setSelectedMonth = monthIndex => {
    const payload = { userId: this.state.selectedUser.value, month: monthIndex, year: this.state.selectedYear, needYear: this.props.loggedInUser._id !== this.state.selectedUser.value };
    this.getTimesheetDetailsOfUser(payload);
  };

  isFullWidth = (rowNode) => {
    return rowNode.data.totalHours || rowNode.data.monthlyHours;
  };

  isAdminDrafter = () => {
    const user = this.state.selectedUser;
    const { id } = user.role;
    let isAdminDrafter = true;
    if (id === Constant.ROLE_ID.ENGINEER || id === Constant.ROLE_ID.MANAGER) {
      isAdminDrafter = false;
    }
    return isAdminDrafter;
  };

  getRowHeight = (params) => {
    return this.isFullWidth(params) ? 60 : 38;
  };

  getRowData = () => {
    const userHourTrackers = sortByDate(this.props.hourTrackers, 'date');
    let hourTrackers = [];
    let totalHours = 0;
    let monthlyHours = 0;
    userHourTrackers.forEach((hourTracker, index) => {
      monthlyHours += hourTracker.hoursSpent;
      totalHours += hourTracker.hoursSpent;
      hourTrackers.push(formatHourtrackerData(hourTracker, this.props.loggedInUser._id));
      if (!this.state.dayView && (index === userHourTrackers.length - 1) && this.state.isSortedByDate) {
        hourTrackers.push({
          date: this.state.sortPreference === 'asc' ? moment(hourTracker.date).endOf('month') : moment(hourTracker.date).startOf('day'),
          monthlyHours
        });
        totalHours = 0;
      } else if (this.state.dayView && this.state.isSortedByDate && (index === userHourTrackers.length - 1 || moment(userHourTrackers[index + 1].date).format('D') !== moment(hourTracker.date).format('D'))) {
        hourTrackers.push({
          date: moment(hourTracker.date).hours(23).minute(59).second(0).format('MMM DD, YYYY'),
          totalHours,
          isAdminDrafter: this.isAdminDrafter(),
          selectedUser: this.state.selectedUser,
          user: this.props.loggedInUser,
          drafterAdminData: this.props.drafterAdminData
        });
        totalHours = 0;
      }
    });
    return hourTrackers;
  };

  sortChanged = (params) => {
    const sortModel = this.gridApi.getSortModel();
    if (sortModel.length) {
      if (sortModel[0].colId !== 'date') {
        this.setState({ isSortedByDate: false });
      } else {
        this.setState({ isSortedByDate: true, sortPreference: sortModel[0].sort });
      }
    }
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

  renderTimesheetGrid = () => {
    return (
      <div id='grid-wrapper' className='hourtracker-table-container page-wrapper'>
        <div className='ag-theme-balham custom-grid-layout'>
          <PLPDataGrid
            columnDefs={timesheetTableHeaders}
            rowData={this.getRowData()}
            onCellValueChanged={this.onCellValueChanged}
            domLayout='autoHeight'
            getRowHeight={this.getRowHeight}
            fullWidthCellRenderer='fullWidthCellRenderer'
            isFullWidthCell={this.isFullWidth}
            onGridReady={this.onGridReady}
            onSortChanged={this.sortChanged}
            frameworkComponents={{
              userImageRender: this.userImageRender,
              hourInputRender: this.hourInputRender,
              editInput: this.renderEditInputBox,
              archiveIconRender: this.archiveIconRender,
              dateRender: this.dateRender,
              fullWidthCellRenderer: FullWidthCellRenderer
            }}
            onGridSizeChanged={this.onGridSizeChanged}
          />
        </div>
      </div>
    );
  };

  toggleDayView = isChecked => {
    this.setState({ dayView: isChecked });
    const updatableRows = [];
    this.gridApi.forEachNode((node) => {
      if (node.data.totalHours || node.data.monthlyHours) {
        updatableRows.push(node);
      }
    });
      setTimeout(() => this.gridApi.redrawRows(updatableRows), 0);
  };

  onGridReady = params => {
    this.gridApi = params.api;
  };

  handleEmployeeChange = (value) => {
    const selectedUser = this.props.employees.find(emp => emp.value === value);
    this.setState({ selectedUser });
    const payload = { userId: value, month: this.state.selectedMonth, year: this.state.selectedYear, needYear: true };
    this.getTimesheetDetailsOfUser(payload);
  };

  toggleMultipleHourTrackerModal = (value) => {
    this.setState({ isMultipleHourTrackerOpen: value });
  };

  closeHourTrackerForm = () => {
    this.setState({ isHourTrackerFormOpen: false });
  };

  openHourTrackerForm = () => {
    this.setState({ isHourTrackerFormOpen: true });
  };

  getMenuOverlay = () => {
    if (!this.state || !this.state.yearOptions) {
      return null
    }
    return <Menu>
      {this.state.yearOptions.map(year => {
        return (
          <Menu.Item key={year.value}>
            <a className='ant-dropdown-link' href='#' onClick={() => this.setSelectedYear(year.value)}>{year.value}</a>
          </Menu.Item>
        );
      })}
    </Menu>;
  };

  getSwitchToggle = () => <div className='switch-wrapper'>
    <Switch checked={this.state.dayView} onChange={this.toggleDayView} style={{ marginRight: '10px' }} />
    <span>Day View</span>
  </div>;

  getFilterSearchRenderer = () => <div className='input-wrapper'>
    {
      !this.props.isPersonal &&
      <Select
        showSearch
        style={{ width: 200 }}
        className='table-select'
        dropdownClassName='select-options'
        placeholder='Enter Name'
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        optionFilterProp='text'
        handleChange={this.handleEmployeeChange}
        options={this.props.employees}
        data='listTimeSheetEmployees'
      />
    }
    <PLPInput
      className='filter-search-input'
      placeholder='Filter'
      onChange={this.setFilter}
      suffix={<Icon type='filter' />}
    />
    <Tooltip title='Add single entry'>
      <Icon
        type='plus-circle'
        style={{
          fontSize: '25px',
          cursor: 'pointer',
          margin: '0 10px'
        }}
        onClick={this.openHourTrackerForm}
      />
    </Tooltip>
    <Tooltip title='Add multiple entries'>
      <Icon
        type='plus-circle'
        style={{
          fontSize: '25px',
          color: '#1890ff',
          cursor: 'pointer',
        }}
        theme='filled'
        twoToneColor='#41A5FB'
        onClick={() => this.toggleMultipleHourTrackerModal(true)}
      />
    </Tooltip>
  </div>;

  getYearAndMonthsRenderer = () => <div
    style={{
      display: 'flex',
      fontWeight: '700',
      textAlign: 'center',
      margin: '25px 0px'
    }}
  >
    <Dropdown overlay={this.getMenuOverlay()} trigger={['click']}>
      <a className='ant-dropdown-link' href='#'>
        {this.state.selectedYear}
        <Icon type='down' />
      </a>
    </Dropdown>
    {moment.monthsShort().map((month, index) => {
      return (
        <div key={index} style={{ flex: '1' }}>
          <span
            style={{
              cursor: 'pointer',
              color:
                this.state && index === this.state.selectedMonth
                  ? 'rgb(140, 195, 65)'
                  : 'black'
            }}
            onClick={() => this.setSelectedMonth(index)}
          >
            {month}
          </span>
        </div>
      );
    })}
  </div>;

  setFilter = (e) => {
    this.gridApi.setQuickFilter(e.target.value)
  };

  handleMultipleHourTrackerError = (error) => {
    this.setState({ multipleHourTrackerError: error });
  };

  handleMultipleHourTrackerLoader = (value) => {
    this.setState({ isLoadingMultipleHourTracker: value });
  };

  renderMultipleHourTrackerForm = () => <MultipleHourtrackerModal
    userId={this.props.loggedInUser._id}
    closePopup={() => this.toggleMultipleHourTrackerModal(false)}
  />;

  renderHourTrackerForm = () => {
    return <AddHourtrackerForm
      showEmployees={!this.props.isPersonal}
      showOther
      enableAllDate={true}
      togglePopup={this.closeHourTrackerForm}
      selectedScope={this.state.selectedScope}
      loggedInUserId={this.state.selectedUser.value}
    />
  };

  render = () => {
    return (
      <div className='timesheet-table-container main-page_wrapper'>
        <div className='filter-container page-wrapper'>
          {this.state.isSortedByDate && this.getSwitchToggle()}
          {this.getFilterSearchRenderer()}
        </div>
        {this.getYearAndMonthsRenderer()}
        <Async
          identifier='Timesheet'
          promise={this.promise}
          loader={<Loader />}
          error={<ErrorPage />}
          content={this.renderTimesheetGrid()}
        />
        {this.state.isMultipleHourTrackerOpen && this.renderMultipleHourTrackerForm()}
        {this.state.isHourTrackerFormOpen && this.renderHourTrackerForm()}
      </div>
    );
  };
}

function formatHourtrackerData(hourtracker, loggedInUserId) {
  let data = {
    user: hourtracker.employee,
    date: formatDate(hourtracker.date),
    hourId: hourtracker.id,
    _id: hourtracker._id,
    other: hourtracker.other,
    hoursSpent: hourtracker.hoursSpent,
    projectName: '-',
    jobNumber: '-',
    scope: '-',
    contractor: '-',
    scopeNote: '-',
    isDeletable: hourtracker.employee._id === loggedInUserId,
    note: hourtracker.note
  };

  if (hourtracker.task) {
    data = {
      ...data,
      projectName: hourtracker.task.title,
      jobNumber: getTaskNumber(hourtracker.task),
      scope: hourtracker.scope.number,
      contractor: hourtracker.task.contractor.name,
      scopeNote: hourtracker.scope.note,
      other: '-',
      scopeId: hourtracker.scope.id
    };
  }
  return data;
}

function mapStateToProps() {
  const employees = sortEmployee(EmployeeModel.list()
    .map(employee => {
      return {
        text: `${employee.props.firstName} ${employee.props.lastName}`,
        key: employee.props._id,
        value: employee.props._id,
        role: { ...employee.props.role },
        employeeCode: employee.props.employeeCode
      };
    }));
  return {
    loggedInUser: UserModel.last().props,
    hourTrackers: HourTrackerModel.list().map(item => item.props),
    employees,
    drafterAdminData: DrafterAdminModal.list().map(item => item.props)
  };
}

TimesheetTableImpl.propTypes = {
  onGridReady: PropTypes.func,
  selector: PropTypes.string,
  pagination: PropTypes.bool
};

TimesheetTableImpl.defaultProps = {
  onGridReady: () => { },
  selector: 'group',
  pagination: false
};

export const TimesheetTable = connect(mapStateToProps)(TimesheetTableImpl);
