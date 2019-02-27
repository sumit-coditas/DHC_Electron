import React from 'react';
import moment from 'moment';
import forEach from 'lodash/forEach';
import orderBy from 'lodash/orderBy';
import cloneDeep from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import { Popup, Dropdown, Dimmer, Loader } from 'semantic-ui-react';
import DatePicker from 'material-ui/DatePicker';

import Picture from './../widgets/Picture.js';

export default class HourTracker extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props.isLoading, nextProps.isLoading) || !isEqual(this.props.task.scopes, nextProps.task.scopes) ||
        !isEqual(this.props.options, nextProps.options);
    }

    _formatDate(date) {
        let dateString = '';
        let formattedDate = moment(date);

        dateString += formattedDate.format('M/D/YY');
        return dateString;
    }

    _dateWrapper(date) {
        let inputDate = new Date(date);
        if (inputDate.getFullYear() < 2000) {
            return moment(inputDate).add('years', 100).toDate();
        }
        return new Date(date);
    }

    _revNumberClassName(hourTracker) {
        if (!hourTracker.revNumber || hourTracker.revNumber === '') {
            return 'hourTrackerView'+' borderBottom';
        }
        return 'hourTrackerView';
    }

    render() {
        let self = this;
        let userHourTrackers = [];
        let allHourTrackers = [];
        forEach(self.props.task.scopes, (scope) => {
            forEach(scope.hourTrackers, (hourTracker) => {
                let obj = { hourTracker: hourTracker, scope: scope };
                allHourTrackers.push(obj);
            });
        });
        allHourTrackers = orderBy(allHourTrackers, ['hourTracker.date'], ['desc']);
        const scopeOptions = cloneDeep(self.props.options);
        scopeOptions.splice(0, 1);

        forEach(allHourTrackers, (hourTrackerScopeObj, index) => {
            userHourTrackers.push(
                <div key={'scope' + index + 'hourTracker' + index} className='modal-bucket-row w-row'>
                    <div className='w-clearfix w-col w-col-2' style={{ width: '8.66667%' }}>
                        <Popup trigger={<Picture avatar href='#' src={hourTrackerScopeObj.hourTracker.employee.picture} />}
                            content={hourTrackerScopeObj.hourTracker.employee.firstName + ' ' + hourTrackerScopeObj.hourTracker.employee.lastName} />
                    </div>
                    <div className='w-col w-col-3' style ={{ width: '30%' }}>
                        <div className='team-role'>
                            <Dropdown options={scopeOptions} value={hourTrackerScopeObj.scope._id}
                                onChange={self.props.updateScope.bind(self, hourTrackerScopeObj.hourTracker, hourTrackerScopeObj.scope)} />
                        </div>
                    </div>
                    
                    <div className='w-col w-col-1'>
                        <div className='team-role'>
                            <input className='hourTrackerView' type='number' step='0.25' value={hourTrackerScopeObj.hourTracker.hoursSpent}
                                onChange={self.props.onHoursChange.bind(self, hourTrackerScopeObj.hourTracker, hourTrackerScopeObj.scope)}
                                onBlur={self.props.updateHoursSpent.bind(self, hourTrackerScopeObj.hourTracker, hourTrackerScopeObj.scope)} />
                        </div>
                    </div>
                    <div className='w-col w-col-2'>
                        <div>
                            <DatePicker
                                firstDayOfWeek={0}
                                name='hourTrackerDate'
                                style={{ width: '45px', margin: 'auto' }}
                                className='hourTrackerView'
                                value={new Date(hourTrackerScopeObj.hourTracker.date)}
                                mode='landscape'
                                onChange={self.props.updateHourTrackerDate.bind(self, hourTrackerScopeObj.hourTracker, hourTrackerScopeObj.scope)}
                                formatDate={self._formatDate.bind(self)}
                            />
                        </div>
                    </div>
                    <div className='w-col w-col-3 hourTrackerNotes'>
                        <a className='fa team-role' href='#' onClick={self.props.viewNotes.bind(self, hourTrackerScopeObj.hourTracker, hourTrackerScopeObj.scope, true)}>
                            {hourTrackerScopeObj.hourTracker.note ? hourTrackerScopeObj.hourTracker.note : <p>&#xf044;</p>}
                        </a>
                    </div>
                    {hourTrackerScopeObj.hourTracker.employee._id === self.props.loggedInUser._id &&
                        <div>
                            <div className='w-col w-col-1'>
                                <a className='fa team-role' href='#' onClick={self.props.deleteActivity.bind(self, hourTrackerScopeObj.hourTracker, hourTrackerScopeObj.scope)}>&#xf00d;</a>
                            </div>
                        </div>
                    }
                </div>
            );
        });
        return (
            <div>
                <div>
                    <div className='modal-section-wrapper'>
                        <div className='modal-section-title'>
                            <span className='fa'></span>
                            <span className='modal-name-field'>Hour Tracker</span>
                        </div>
                    </div>
                    <a className='fa add-new-tag' href='#' onClick={self.props.toggleHourTrackerModal.bind(self)}>
                        
                    </a>
                </div>
                <div className='modal-col-wrap'>
                    <div className='team-role-header'>
                        <div className='w-row'>
                            <div className='w-col w-col-1' >
                                <span>User</span>
                            </div>
                            <div className='w-col w-col-3' style ={{ width: '30%' }}>
                                <span>Scope</span>
                            </div>
                            {/* <div className='w-col w-col-3'>
                                <span>Rev Number</span>
                            </div> */}
                            <div className='w-col w-col-1'>
                                <span>Hours</span>
                            </div>
                            <div className='w-col w-col-2' style={{ width: '17%' }}>
                                <span>Date</span>
                            </div>
                            <div className='w-col w-col-3'>
                                Note
                            </div>
                            <div className='w-col w-col-1' style={{ width: '10%' }}>
                                Delete
                            </div>
                        </div>
                    </div>
                    {userHourTrackers.length !== 0 ? userHourTrackers : <div className='helptext'>No Hour Tracker created yet. Click + button to create a new one.</div>}
                    <Dimmer inverted active={self.props.isLoading}>
                        <Loader />
                    </Dimmer>
                </div>
            </div>
        );
    }
}
