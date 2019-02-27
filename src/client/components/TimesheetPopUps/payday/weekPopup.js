import React from 'react';
import moment from 'moment';
import { Modal, Tooltip } from 'antd';
import { PLPPureComponent, PLPInput } from '../../../baseComponents/importer';
import { fetchWorkDetails } from '../service';
import { getStartDateOfDay, getFridayDate, extractHoursAndAppendToDate } from '../../../utils/DateUtils';
import { UserModel } from '../../../model/UserModel';
import { HourTrackerModel } from '../../../model/AppModels/HourTrackerModel';
import { connect } from 'react-redux';
import { showFaliureNotification, showSuccessNotification, showWarningNotification } from '../../../utils/notifications';
import { getManagerEngineerWeeklyData, getDrafterAdminWeeklyData, TOOLTIPS } from '../util';
import ManagerEngineerTable from './managerPopupTable';
import DailyPopUp from '../daily/DailyPopUp';
import DrafterAdminTable from './drafterPopupTable'
import { DrafterAdminModel } from '../../../model/AppModels/DrafterAdminModel';
import { updateHourTrackerReport } from '../../../utils/promises/timesheetPromises';
import { showConfirmationModal, showConfirmationModalWithCancel } from '../../../utils/cofirmationModal';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';

class WeekDayPop extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = this.getInitial();
        this.payDayFormDate = null
    }

    getInitial() {
        const loggedInUser = this.props.user;
        return {
            disableForm: false,
            disabledCancelBtn: true,
            showLoader: true,
            isVisiblePopUp: true, showDailyPopup: null, note: '', loading: false,
            isManagerEngineer: ['Manager', 'Engineer'].includes(loggedInUser.role.name) || loggedInUser._id === '58bed49562b976001126f79a',
            endDate: getStartDateOfDay(moment().subtract(1, 'day')),
            timeInOutObjects: null
        }
    }

    componentWillMount() {
        this.getWorkDetails();
    }

    getWorkDetails = () => {
        const endDate = getStartDateOfDay(moment().subtract(1, 'day'));
        const startDate = getStartDateOfDay(moment(endDate).subtract(14, 'days'));
        const payload = { startDate, endDate, "userId": this.props.user._id };
        fetchWorkDetails(payload, () => this.setState({ showLoader: false }))
    };

    handleTimeChange = (time, params) => {
        // time = moment(time).set({ millisecond: 0, second: 0 }).valueOf()
        let drafterData = DrafterAdminModel.getDrafterAdminDataById(params.data.id);
        if (drafterData && drafterData.props) {
            drafterData = { ...drafterData.props };
            drafterData[params.colDef.field] = extractHoursAndAppendToDate(time, params.data.date);
            new DrafterAdminModel(drafterData).$save()
        }
    };

    closePopUp = () => this.setState({ isVisiblePopUp: false });

    handleSubmitClick = () => {
        let drafterAdminHours = this.props.drafterAdminHours;
        const timeInOutObject = [];

        if (!this.state.isManagerEngineer) {
            drafterAdminHours.forEach((item, index) => {
                if (index === drafterAdminHours.length - 1) return;
                let data = {
                    date: item.date,
                    lunchIn: item.regular >= 6 && item.lunchIn || null,
                    lunchOut: item.regular >= 6 && item.lunchOut || null,
                    timeIn: item.regular > 0 && item.timeIn || null,
                    timeOut: item.regular > 0 && item.timeOut || null,
                    overtime: item.overtime,
                    pto: item.pto,
                    regular: item.regular,
                    id: item.id
                };
                if (item._id) {
                    data._id = item._id;
                }
                timeInOutObject.push(data);
            })
        }
        const body = {
            endDate: moment(this.state.endDate).startOf('day').format(),
            startDate: moment(this.state.endDate).subtract(14, 'days').startOf('day').format(),
            userId: this.props.user._id,
            note: this.state.note,
            timeInOutObject,
            isManagerEngineer: this.state.isManagerEngineer,
            timeZoneOffset: new Date().getTimezoneOffset()
        };
        this.submitReport(body)
    };

    submitReport = async (body) => {
        const title = 'Sign and Submit Report';
        const content = `This report will be submitted to HR department for salary processing.
        You can not change this report once submitted.
        Are you sure you want to submit?`;
        try {
            if (!this.state.disableForm) {
                this.setState({ loading: true });
                showConfirmationModalWithCancel(title, content,
                    async () => {
                        try {
                            const result = await updateHourTrackerReport(body);
                            this.payDayFormDate = result.payDayFormDate;
                            // UserModel.updateCurrentUser(result)
                            showSuccessNotification('Submitted successfully');
                            this.setState({ loading: false, disableForm: true })
                        } catch (e) {
                            showFaliureNotification('Error in submitting pay day. Please try again.');
                            this.setState({ loading: false, disabledCancelBtn: false })
                        }

                    },
                    () => { console.log('canceled', this.setState({ loading: false })) }
                );
            } else {
                this.setState({ isVisiblePopUp: false });
                UserModel.updateCurrentUser({ payDayFormDate: this.payDayFormDate });
                this.props.closePopUp()
            }
        } catch (error) {
            this.setState({ loading: false, disabledCancelBtn: false });
        }
    };

    handleDailyPopUp = (hour = null) => this.setState({ showDailyPopup: hour });

    handleNoteChange = (e) => this.setState({ [e.target.name]: e.target.value });

    renderHighlighterInfo = () => <Tooltip><div className="highlight-information-container">
        <span title={TOOLTIPS.red} className="highlight-information red-highlighter" ></span>
        <span title={TOOLTIPS.yellow} className="highlight-information yellow-highlighter" ></span>
        <span title={TOOLTIPS.default} className="highlight-information default-highlighter" ></span>
    </div>
    </Tooltip>;

    renderDailyPopUp = () => <DailyPopUp
        showLoader={false}
        disableCancelButton={false}
        disableForm={this.state.disableForm}
        hideTimeMenu={true}
        closePopUp={this.handleDailyPopUp}
        selectedDate={this.state.showDailyPopup.date}
        hideFooter
    />;

    renderDrafterTable = () => <DrafterAdminTable
        showLoader={this.state.showLoader}
        payDate={getFridayDate(this.state.endDate)}
        disableForm={this.state.disableForm}
        onTimeChange={this.handleTimeChange}
        onDetailPress={this.handleDailyPopUp}
        tableData={this.props.drafterAdminHours} />;

    renderManagerTable = () => <ManagerEngineerTable
        showLoader={this.state.showLoader}
        payDate={getFridayDate(this.state.endDate)}
        disableForm={this.state.disableForm}
        onDetailPress={this.handleDailyPopUp}
        hourTrackers={this.props.hourTrackers} />;

    renderPaydayNote = () => <PLPInput
        className="note-section"
        disabled={this.state.disableForm}
        name="note"
        placeholder="Enter Note" autosize={{ minRows: 2, maxRows: 6 }}
        onChange={this.handleNoteChange} label="Note" />;

    render() {
        return (
            <Modal
                visible={this.state.isVisiblePopUp}
                width='80%'
                centered
                className='purchase-order-container'
                onCancel={this.closePopUp}
                onOk={this.handleSubmitClick}
                closable={false}
                cancelButtonProps={{ disabled: this.state.disabledCancelBtn, className: 'cancel-btn-right' }}
                confirmLoading={this.state.loading}
                title={'Payday Timesheet'}
                maskClosable={false}
                keyboard={false}
                okButtonProps={{ disabled: this.state.loading, style:changeSubmitButtonStyle(this.state.loading) }}
                okText={this.state.disableForm ? 'Close Report' : 'Submit'}
            >
                <div>
                    {!this.state.isManagerEngineer && this.renderHighlighterInfo()}
                    {this.state.showDailyPopup && this.renderDailyPopUp()}
                    {this.state.isManagerEngineer && this.renderManagerTable() || this.renderDrafterTable()}
                </div>
                {this.renderPaydayNote()}
            </Modal>
        );
    }
}

function mapStateToProps() {
    const endDate = getStartDateOfDay(moment().subtract(1, 'day'));
    const hourTrackers = HourTrackerModel.list().map(item => item.props);
    const drafterAdminData = DrafterAdminModel.list().map(item => item.props);
    const mangerEngineerData = getManagerEngineerWeeklyData(hourTrackers, endDate);
    const drafterAdminHours = getDrafterAdminWeeklyData(hourTrackers, drafterAdminData, endDate);
    let { _id, role, id } = UserModel.last().props;
    return {
        user: { _id, role, id },
        hourTrackers: mangerEngineerData,
        drafterAdminHours,
        drafterAdminModelList: DrafterAdminModel.list().map(item => item.props).filter(d => d.timeIn)
    }
}

export default connect(mapStateToProps)(WeekDayPop);
