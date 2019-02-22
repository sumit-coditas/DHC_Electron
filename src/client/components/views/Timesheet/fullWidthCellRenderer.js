import './Timesheet.scss';

// import { TimePicker } from 'antd';
import { TimePickerGrid } from '../../../baseComponents/TimePickerGrid';
import moment from 'moment';
import React from 'react';
import shortid from 'shortid';

import { getDefaultTime } from '../../../utils/DateUtils';

import { DrafterAdminModal } from '../../../model/payDayModels/DrafterAdminModal';
import { showFaliureNotification, showSuccessNotification } from '../../../utils/notifications';
import { createTimeInOutRecord, updateTime } from '../../../utils/promises/timesheetPromises';

const fieldname = {
    timeIn: 'Time in',
    lunchIn: 'Lunch in',
    lunchOut: 'Lunch out',
    timeOut: 'Time out'
};

export default class FullWidthCellRenderer extends React.Component {
    constructor(props) {
        super(props);
        const node = props.node;
        props.reactContainer.style.display = 'inline-flex';
        props.reactContainer.style.width = '100%';
        props.reactContainer.style.height = '100%';
        props.reactContainer.style.alignItems = 'center';
        props.reactContainer.style.justifyContent = 'center';
        props.reactContainer.style.backgroundColor = '#f8fcff';
        props.reactContainer.style.borderBottom = '1px solid #b9b2b2';

        this.state = {
            totalHours: node.data.totalHours,
            date: node.data.date,
            monthlyHours: node.data.monthlyHours || 0,
            isAdminDrafter: node.data.isAdminDrafter && node.data.user._id !== '58bed49562b976001126f79a',
            selectedUser: node.data.selectedUser,
            user: node.data.user,
            drafterAdminData: node.data.drafterAdminData
        };
    }

    getTimes = (date) => {
        const hourTrackerDate = moment(date).format('DD-MM-YYYY');
        let data;
        this.state.drafterAdminData.map(row => {
            const adminDrfterDate = moment(row.date).format('DD-MM-YYYY');
            if (adminDrfterDate === hourTrackerDate) {
                data = row;
            }
        });
        if (!data) {
            data = {
                date: moment(date).valueOf(),
                lunchIn: moment().hours(11).minute(30).second(0).valueOf(),
                lunchOut: moment().hours(12).minute(30).second(0).valueOf(),
                timeIn: moment().hours(7).minute(0).second(0).valueOf(),
                timeOut: moment().hours(16).minute(0).second(0).valueOf(),
                id: shortid.generate() + shortid.generate(),
                user: this.state.user._id
            };
            data.timeIn = !data.timeIn ? moment(dateItem).set({ hours: 7, minutes: 0 }).valueOf(): data.timeIn;
            data.timeOut = !data.timeOut ? moment(dateItem).set({ hours: 7, minutes: 0 }).valueOf(): data.timeOut;

            new DrafterAdminModal(data).$save();
        }
        return data;
    };

    getTimePicker = (timePickerEntity, timePickerFor, id) => <TimePickerGrid
        popupClassName='custom-timepicker-class'
        disabled={this.state.selectedUser.value !== this.state.user._id}
        use12Hours
        allowEmpty={false}
        format="h:mm a"
        className="time-picker"
        minuteStep={15}
        defaultValue={moment(timePickerEntity)}
        onChange={(value) => this.handleTimeChange(id, timePickerFor, value)}
    />;

    handleTimeChange = (_id, type, value) => {
        let data = DrafterAdminModal.get(_id);
        value = !value.isValid() ? getDefaultTime(type, data.props.date) : value;
        data.props[type] = moment(value, 'hh:mm a').valueOf();
        if (data.props._id) {
            let payload = {
                [`${type}`]: moment(value, "hh:mm a").valueOf(),
                _id: data.props._id
            };
            this.updatedTime(payload, type);
        } else {
            this.createTimeInOutRecord({
                user: data.props.user,
                date: data.props.date,
                timeIn: data.props.timeIn,
                timeOut: data.props.timeOut,
                lunchIn: data.props.lunchIn,
                lunchOut: data.props.lunchOut,
            }, type)
        }
        new DrafterAdminModal(data.props).$save();
    };

    createTimeInOutRecord = (payload, field) => {
        createTimeInOutRecord(payload).then(response => {
            new DrafterAdminModal(response.data).$save();
            showSuccessNotification(`${fieldname[field]} time updated successfully.`);
        }).catch(() => showFaliureNotification(`Failed to update ${fieldname[field]} time.`))
    };

    updatedTime = (payload, field) => {
        updateTime(payload).then(response => {
            new DrafterAdminModal(response.data).$save();
            showSuccessNotification(`${fieldname[field]} time updated successfully.`);
        }).catch(() => showFaliureNotification(`Failed to update ${fieldname[field]} time.`))
    };


    getTimeInOutRow = (date, hour) => {
        const { timeIn, timeOut, lunchIn, lunchOut, id } = this.getTimes(date);
        return (
            <div className='timesheet-container' style={{ marginTop: '0px', width: '100%' }}>
                <div className='data-container'>
                    <div className='lable'>Time In:</div>
                    {this.getTimePicker(timeIn, 'timeIn', id)}
                </div>
                <div className='data-container'>
                    <div className='lable'>Lunch In:</div>
                    {hour >= 6 ? this.getTimePicker(lunchIn, 'lunchIn', id) : '-'}
                </div>
                <div className='data-container'>
                    <div className='lable'>Lunch Out :</div>
                    {hour >= 6 ? this.getTimePicker(lunchOut, 'lunchOut', id) : '-'}
                </div>
                <div className='data-container'>
                    <div className='lable'>Time Out:</div>
                    {this.getTimePicker(timeOut, 'timeOut', id)}
                </div>
            </div>);
    };

    render() {
        return (
            <div className='flex-column'
            >
                {
                    this.state.isAdminDrafter &&
                    this.getTimeInOutRow(this.state.date, this.state.totalHours)
                }
                <div className='flex-row'>
                    <span><strong>{this.state.monthlyHours ? moment(this.state.date).format('MMM, YYYY') : moment(this.state.date).format('MMM DD, YYYY')}</strong></span>
                    <span style={{ margin: '0 10px', fontSize: '14px' }}><strong>Total Hours: {this.state.monthlyHours ? this.state.monthlyHours : this.state.totalHours}</strong></span>
                </div>
            </div>
        );
    }
}
