import './styles/oneDayPopup.scss';

import { Col, Modal, Row, TimePicker } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import shortid from 'shortid'
import { AddIcon, DeleteIcon, PLPDatePicker, PLPPureComponent } from '../../../baseComponents/importer';
import { DrafterAdminModel } from '../../../model/AppModels/DrafterAdminModel';
import { HourTrackerModel } from '../../../model/AppModels/HourTrackerModel';
import { UserModel } from '../../../model/UserModel';
import { showConfirmationModal } from '../../../utils/cofirmationModal';
import { dailyPopUpHeader, dailyPopUpHeaderDisabled } from '../../../utils/constants/ScopeTableHeaders';
import { extractHoursAndAppendToDate, getFridayDate, getStartDateOfDay } from '../../../utils/DateUtils';
import { updatePayDate } from '../../../utils/promises/timesheetPromises';
import { AddHourtrackerForm } from '../../hourTracker/addHour';
import { HourInput } from '../../hourTracker/wrapperComponents';
import { PLPDataGrid } from '../../reusableComponents/PLPDataGrid';
import { deleteHourRecord, fetchWorkDetails, updateHourtrackerCall, fetchWorkDetailsDaily } from '../service';
import { getDailyPopUpTableData, getDrafterAdminData } from '../util';
import { PLPDATE_FORMAT } from '../../../utils/constant';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';
import { showWarningNotification } from '../../../utils/notifications';

const MenuItem = [
    { title: 'Time In', field: 'timeIn' },
    { title: 'Lunch In', field: 'lunchIn' },
    { title: 'Lunch Out', field: 'lunchOut' },
    { title: 'Time Out', field: 'timeOut' },
]

const defaultTodayTimeIn = moment().startOf('day').add('hours', 7);
const defaultTodayLunchIn = moment().startOf('day').add(11.5, 'hours').valueOf();
const defaultTodayLunchOut = moment().startOf('day').add(12.5, 'hours').valueOf();
const defaultTodayTimeOut = moment().startOf('day').add(16, 'hours').valueOf();


class DailyPopUp extends PLPPureComponent {
    state = this.getInitial()

    getInitial() {
        const loggedInUser = this.props.user
        return {
            disableDateSelection: this.props.selectedDate,
            isVisiblePopUp: true,
            showLoader: false,
            note: '', todayTimeIn: defaultTodayTimeIn,
            startDate: this.props.selectedDate || getStartDateOfDay(moment().subtract(1, 'day')),
            showAddHourModal: false,
            timeInOutObject: null,
            isManagerEngineer: ['Manager', 'Engineer'].includes(loggedInUser.role.name) || loggedInUser._id === '58bed49562b976001126f79a'
        }
    }

    componentDidMount() {
        if (!this.props.selectedDate) {
            this.getWorkDetails()
        }
    }

    getWorkDetails() {
        this.setState({ showLoader: true });
        DrafterAdminModel.deleteAll();
        HourTrackerModel.deleteAll();
        const startDate = getStartDateOfDay(moment(this.state.startDate))
        const endDate = getStartDateOfDay(moment(this.state.startDate).add(1, 'day'))
        const payload = { startDate, endDate, userId: this.props.user._id }
        fetchWorkDetailsDaily(payload, () => this.setState({ showLoader: false }))
    }

    handleSelectDate = (date, data) => {
        const startDate = getStartDateOfDay(date);
        this.setState({ startDate }, () => this.getWorkDetails());
    }

    prepareBody() {
        const userId = this.props.user._id;
        const obj = {
            date: moment(this.state.startDate).valueOf(),
            'timeIn': extractHoursAndAppendToDate(this.state.timeInOutObject.timeIn, this.state.startDate),
            'lunchIn': extractHoursAndAppendToDate(this.state.timeInOutObject.lunchIn, this.state.startDate),
            'lunchOut': extractHoursAndAppendToDate(this.state.timeInOutObject.lunchOut, this.state.startDate),
            'timeOut': extractHoursAndAppendToDate(this.state.timeInOutObject.timeOut, this.state.startDate),
            userId
        }
        return [{ ...obj }]
    }

    handleSubmitClick = async () => {
        this.setState({ showLoader: true });
        try {
            if (!this.props.selectedDate) {
                const { startDate, isManagerEngineer, note } = this.state
                const timeInOutObject = this.state.timeInOutObject && this.prepareBody() || [{ ...this.props.drafterAdminData[0], userId: this.props.user._id }]
                timeInOutObject.todaysTimeIn = moment(this.state.todayTimeIn).valueOf();
                const payDate = moment(getFridayDate())
                const body = {
                    date: moment(startDate).valueOf(),
                    startDate,
                    endDate: getStartDateOfDay(moment(startDate).add(1, 'day')),
                    modalType: 0,
                    userId: this.props.user._id,
                    payDate,
                    type: 1,
                    isManagerEngineer,
                    note,
                    timeInOutObject,
                    hourTrackers: [...this.props.hourTrackerData],
                    todaysTime: {
                        date: moment().valueOf(),
                        timeIn: moment(this.state.todayTimeIn).valueOf(),
                        timeOut: defaultTodayTimeOut,
                        lunchIn: defaultTodayLunchIn,
                        lunchOut: defaultTodayLunchOut,
                        userId: this.props.user._id
                    }
                }
                const result = await updatePayDate(body);
                this.setState({ showLoader: false });
                UserModel.updatePayDate(result)
            }
            this.closePopUp()
        } catch (error) {
            this.setState({ showLoader: false });
            console.log("error", error)
        }
    }

    closePopUp = () => {
        if (this.props.selectedDate) {
            this.props.closePopUp();
        }
        this.setState({ isVisiblePopUp: false });
        if (!this.props.selectedDate) { this.props.closePopUp() }
    }

    handleAddHour = () => this.setState({ showAddHourModal: true });

    handleClose = (a, scope) => {
        if (!a.showAddHourTrackerForm) {
            this.setState({ showAddHourModal: false });
        }
    }

    handleDelete = (params) => {
        const title = 'Delete  Hour Record ?', content = `Are you sure you want to delete Hour ? This action will delete hour from scope.`;
        showConfirmationModal(title, content, () => deleteHourRecord(params.data));
    }

    handleHourChange = (value, params) => {
        if (value == 0) {
            showWarningNotification('Invalid Hours')
            params.node.data[params.colDef.field] = params.node.data[params.colDef.field]
            params.api.redrawRows({ rowNodes: [params.node] });
            return;
        }
        const hour = { [params.colDef.field]: value, id: params.data.hourId, _id: params.data.id, scopeId: params.data.scopeId }
        updateHourtrackerCall(hour)
    }

    handleCellChange = (params) => {
        const hour = { [params.colDef.field]: params.newValue, id: params.data.hourId, _id: params.data.id, scopeId: params.data.scopeId }
        updateHourtrackerCall(hour)
    }

    deleteIconRender = (params) => (params.data.isDummyRow || params.data.id == '-') && <p>{'-'}</p> || < DeleteIcon disabled={this.props.disableForm} data={params} onClick={this.handleDelete} />;

    getTotalHours = () => {
        let value = 0
        this.props.hourTrackerData.forEach(element => {
            value = value + element.hoursSpent
        })
        return value;
    }

    renderAddHourTrackerForm = () => <AddHourtrackerForm
        showOther
        // showTask showScope
        disabledDatePicker={true}
        selectedDate={this.state.startDate}
        disableTask={false}
        togglePopup={this.handleClose} />;

    hourInputRender = (params) => (params.data.isDummyRow || params.data.id == '-') && <p>{'-'}</p> || <HourInput
        onBlur={value => this.handleHourChange(value, params)}
        value={params.value}
        disabled={this.props.disableForm || !params.data.id}
    />

    handleTimeChange = (value, field, params) => {
        // const timeObj = this.state.timeInOutObject || this.props.drafterAdminData[0];
        // const timeInOutObject = {
        //     ...timeObj,
        //     [field]: moment(value).set('seconds', 0).valueOf()
        // };
        // this.setState({ timeInOutObject });
        let drafterData = DrafterAdminModel.getDrafterAdminDataById(params.id)
        if (drafterData && drafterData.props) {
            drafterData = { ...drafterData.props }
            drafterData[field] = moment(value).valueOf()
            new DrafterAdminModel(drafterData).$save()
        } else {
            const drafterAdminData = {
                ...params,
                id: shortid.generate() + shortid.generate(),
                [field]: moment(value).valueOf()
            }
            new DrafterAdminModel(drafterAdminData).$save()
        }
    }

    handleTodayTimeIn = (time, field) => {
        this.setState({ [field]: moment(time).valueOf() });
    }

    handleCancel = () => {
        this.props.onDailyPopupClose()
    }

    render() {
        const minDate = moment().subtract(14, 'days').startOf('day').valueOf();
        const maxDate = moment().subtract(1, 'day').valueOf();
        const disableCancelButton = this.props.disableCancelButton === false ? false : true

        let restProps = {};
        if (this.props.hideFooter) {
            restProps.footer = null;
        }
        return (
            <Modal
                visible={this.state.isVisiblePopUp}
                width='800px'
                className='daily-popup-container'
                onCancel={this.closePopUp}
                closable={this.props.hideFooter || false}
                maskClosable={false}
                onOk={this.handleSubmitClick}
                confirmLoading={false}
                keyboard={false}
                title={'Timesheet - ' + moment(this.state.startDate).format(PLPDATE_FORMAT)}
                okButtonProps={{ disabled: this.state.showLoader, style:changeSubmitButtonStyle(this.state.showLoader) }}
                okText='Submit'
                cancelButtonProps={{ disabled: disableCancelButton, className:'cancel-btn-right' }}
                {...restProps}
            >
                <div>
                    <div className="d-flex">

                        {!this.props.selectedDate &&
                            <div className="flex-item">
                                <label className="ant-form-item" >Select Date</label>
                                <PLPDatePicker
                                    defaultValue={this.state.startDate}
                                    onChange={this.handleSelectDate}
                                    disabledDate
                                    disabledDate={(current) => current.valueOf() > maxDate || current.valueOf() < minDate}
                                />
                            </div>
                        }
                        {!this.state.isManagerEngineer && !this.props.selectedDate && MenuItem.map((item, index) => {
                            const value = this.props.drafterAdminData[0][item.field]
                            return (
                                <div className="flex-item" key={index}>
                                    <label className="ant-form-item" >
                                        {item.title}
                                    </label>
                                    <TimePicker
                                        minuteStep={15}
                                        use12Hours
                                        format={"h:mm a"}
                                        data={item.field}
                                        onChange={(time, formatedTime) => this.handleTimeChange(time, item.field, this.props.drafterAdminData[0])}
                                        value={moment(value)} />
                                </div>
                            );
                        })}
                    </div>
                    {this.state.showAddHourModal && this.renderAddHourTrackerForm()}
                    <div className="scope-table-container" >
                        <div className="ag-theme-balham custom-grid-layout">
                            <PLPDataGrid
                                showLoader={this.state.showLoader}
                                columnDefs={this.props.disableForm ? dailyPopUpHeaderDisabled : dailyPopUpHeader}
                                rowData={this.props.hourTrackerData}
                                onCellValueChanged={this.handleCellChange}
                                frameworkComponents={{
                                    deleteIconRender: this.deleteIconRender,
                                    hourInputRender: this.hourInputRender
                                }}
                                domLayout='autoHeight'
                            />
                        </div>
                    </div>
                    <div className="d-flex" style={{ marginBottom: '16px' }}>
                        {
                            !this.props.selectedDate && !this.state.isManagerEngineer && <TimePicker
                                use12Hours
                                format={"h:mm a"}
                                minuteStep={15}
                                onChange={(time, formatedTime) => this.handleTodayTimeIn(time, 'todayTimeIn')}
                                defaultValue={this.state.todayTimeIn} />
                        }
                        <Row>
                            <p className="margin-top-15 float-right total-hours"> Total = {this.getTotalHours()} </p>
                        </Row>
                    </div>
                    {!this.props.disableForm && <AddIcon onClick={this.handleAddHour} />}
                </div>
            </Modal>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const startDate = getStartDateOfDay(moment().subtract(1, 'day'))
    let hourTrackers = HourTrackerModel.list().map(item => item.props);
    let drafterAdminData = DrafterAdminModel.list().map(item => item.props);
    hourTrackers = getDailyPopUpTableData(hourTrackers, ownProps.selectedDate);
    drafterAdminData = getDrafterAdminData(drafterAdminData, ownProps.selectedDate, startDate);
    let { _id, role, id } = UserModel.last().props;
    return {
        user: { _id, role, id },
        hourTrackerData: hourTrackers,
        drafterAdminData: drafterAdminData,
    }
}

export default connect(mapStateToProps)(DailyPopUp);
