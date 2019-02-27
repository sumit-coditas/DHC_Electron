import React from 'react';
import { Modal } from 'antd';
import moment from 'moment';
import shortid from 'shortid';

import './MultipleHourTracker.scss';

import { PLPPureComponent } from '../../../../baseComponents/importer';

import { MultipleHourTrackerRows } from './MultipleHourTrackerRows';

import { showWarningNotification, showFaliureNotification } from '../../../../utils/notifications';
import Constants from '../../../helpers/Constant';

import { saveMultipleHourtrackers } from '../../../../utils/promises/timesheetPromises';
import { getTodaysLoggedHoursOfUser } from '../../../../utils/promises/UserPromises';
import { changeSubmitButtonStyle } from '../../../../utils/changeBackgroundOfSubmit';

export class MultipleHourtrackerModal extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            multipleHourTrackers: this.generateObjectsForMultipleHourTrackers(),
        };
    }

    generateObjectsForMultipleHourTrackers() {
        const multipleHourTrackers = [];
        for (let i = 0; i < 12; i += 1) {
            multipleHourTrackers.push({
                id: shortid.generate(),
                date: i > 5 ? new Date(moment().add(-1, 'days').startOf('day')) : new Date(moment().startOf('day')),
                scope: '',
                task: null,
                other: '',
                hoursSpent: 0,
                scopeOptions: [],
                note: '',
                showOtherOptions: false,
                section: i > 5 ? 'firstHalf' : 'secondHalf'
            });
        }
        return multipleHourTrackers;
    }

    validateData() {
        let isError = false;
        const multipleHourTrackers = [...this.state.multipleHourTrackers];
        multipleHourTrackers.forEach((hourTracker) => {
            if (!hourTracker.showOtherOptions) {
                if (!hourTracker.task) {
                    showFaliureNotification('Task is required');
                    isError = true;
                    return;
                }

                if (!hourTracker.scope) {
                    showFaliureNotification('Scope is required');
                    isError = true;
                    return;
                }
            } else {
                if (!hourTracker.other) {
                    showFaliureNotification('Other is required');
                    isError = true;
                    return;
                }
            }
            if (!hourTracker.hoursSpent) {
                showFaliureNotification('Hours are required');
                    isError = true;
                    return;
            }
        });
        return !isError;
    }

    handleCancel = () => {
        this.props.closePopup();
    }

    saveMultipleHourTrackers = async () => {
        if (this.validateData()) {
            const data = this.state.multipleHourTrackers.map(item => {
                return {
                    id: item.id,
                    date: new Date(item.date).toUTCString(),
                    hoursSpent: item.hoursSpent,
                    note: item.note,
                    other: item.other,
                    scope: item.scope,
                    task: item.task,
                    employee: this.props.userId
                }
            });
            try {
                await saveMultipleHourtrackers(data);
                await getTodaysLoggedHoursOfUser(this.props.userId);
                this.setState({isLoading: false});
                this.props.closePopup();
            } catch(error) {
                console.error('Unable to save multiple timesheet entries\n', error);
                showFaliureNotification('Unable to save multiple timesheet entries');
                this.setState({isLoading: false});
            }
        } else {
            this.setState({isLoading: false});
        }
    }

    handleOk = () => {
        this.setState({ isLoading: true });
        const submittableHourTrackers = this.state.multipleHourTrackers.reduce((hourTrackers, tracker) => {
            let isBlankRow = false;
            if (!tracker.showOtherOptions) {
                isBlankRow = !tracker.task && !tracker.scope && tracker.hoursSpent === 0;
            } else {
                isBlankRow = tracker.other === '' && tracker.hoursSpent === '';
            }
            !isBlankRow && hourTrackers.push(tracker);
            return hourTrackers;
        }, []);
        if (!submittableHourTrackers.length) {
            showWarningNotification('Multiple hour tracker rows should not be empty.');
            this.setState({isLoading: false});
            return;
        }
        this.setState({multipleHourTrackers: submittableHourTrackers}, () => {
            this.saveMultipleHourTrackers();
        });
    }

    handleTaskChange = (payload) => {
        // deep copying array of objects.
        const multipleHourTrackers = this.state.multipleHourTrackers.map(tracker => {return {...tracker}});
        const index = multipleHourTrackers.findIndex(hourTracker => hourTracker.id === payload.id);
        multipleHourTrackers[index].task = payload.selectedTask;
        multipleHourTrackers[index].scope = '';
        multipleHourTrackers[index].scopeOptions = payload.scopeOptions;
        this.setState({ multipleHourTrackers });
    }

    handleChange = (id, field, value) => {
        const multipleHourTrackers = [...this.state.multipleHourTrackers];
        const index = multipleHourTrackers.findIndex(hourTracker => hourTracker.id === id);
        multipleHourTrackers[index] = { ...multipleHourTrackers[index], [field]: value }
        this.setState({ multipleHourTrackers });
    }

    handleDateChange = (changedDate, section) => {
        // deep copying array of objects.
        const multipleHourTrackers = this.state.multipleHourTrackers.map(tracker => {return {...tracker}});
        multipleHourTrackers.forEach(tracker => tracker.section === section && (tracker.date = changedDate));
        this.setState({ multipleHourTrackers });
    }

    handleAddRow = (hourTracker) => {
        const multipleHourTrackers = [...this.state.multipleHourTrackers];
        const index = multipleHourTrackers.findIndex(tracker => tracker.id === hourTracker.id);
        let newHourTracker = { ...hourTracker };
        newHourTracker.hoursSpent = 0;
        newHourTracker.note = '';
        newHourTracker.id = shortid.generate();
        multipleHourTrackers.splice(index + 1, 0, newHourTracker);
        this.setState({ multipleHourTrackers });
    }

    handleRemoveRow = (hourTracker) => {
        const multipleHourTrackers = [...this.state.multipleHourTrackers];
        if (multipleHourTrackers.length !== 1) {
            const index = multipleHourTrackers.findIndex(tracker => tracker.id === hourTracker.id);
            multipleHourTrackers.splice(index, 1);
            this.setState({ multipleHourTrackers });
        } else {
            showWarningNotification(Constants.NOTIFICATION_MESSAGES.TIMESHEET.REMOVE_ROW);
        }
    }

    getSumOfSection = (sectionedRows) => {
        const sumOfSection = sectionedRows.reduce((sum, ele) => {
            sum+=parseFloat(ele.hoursSpent);
            return sum;
        }, 0);
        return <div className='section-sum'>
            <span>Total Hours: {sumOfSection}</span>
        </div>
    }

    renderSectionedMultipleHourTrackerRows = (type) => {
        const filteredRows =  this.state.multipleHourTrackers.filter(multiRow => multiRow.section === type);
        return <MultipleHourTrackerRows
            sectionedRows={filteredRows}
            handleTaskChange={this.handleTaskChange}
            addRow={this.handleAddRow}
            removeRow={this.handleRemoveRow}
            handleChange={this.handleChange}
            handleDateChange={this.handleDateChange}
        />
    }

    render() {
        return(
            <Modal
                title='Multiple Timesheet Entry'
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width='70%'
                confirmLoading={this.state.isLoading}
                cancelButtonProps={{ className: 'cancel-btn-right' }}
                okButtonProps={{style: changeSubmitButtonStyle(this.state.isLoading)}}
                okText='Submit'
            >
                {this.renderSectionedMultipleHourTrackerRows('firstHalf')}
                {this.renderSectionedMultipleHourTrackerRows('secondHalf')}
            </Modal>
        );
    }
}
