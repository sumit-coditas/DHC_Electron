import React, { PropTypes } from 'react';

import forEach from 'lodash/forEach';
import map from 'lodash/map';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import { Dropdown, Popup, Loader, Dimmer } from 'semantic-ui-react';

import Picture from './../widgets/Picture.js';
import Constant from './../helpers/Constant.js';
import { compareData } from '../helpers/Utility.js';

import TaskAction from './../../actions/TaskAction.js';
import AppAction from './../../actions/AppAction.js';

export default class DesignStatus extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.scopes.length !== nextProps.scopes.length) {
            return true;
        }
        for (let i = 0; i < this.props.scopes.length; i += 1) {
            if (JSON.stringify(this.props.scopes[i].note) !== JSON.stringify(nextProps.scopes[i].note) ||
                JSON.stringify(this.props.scopes[i].engineerDetails) !== JSON.stringify(nextProps.scopes[i].engineerDetails) ||
                JSON.stringify(this.props.scopes[i].drafterDetails) !== JSON.stringify(nextProps.scopes[i].drafterDetails)) {
                return true;
            }
        }
        const shouldRender = compareData(this.props, nextProps,
            [
                'taskId',
                'teamMembers',
                'isLoading',
                'createdBy',
                'loggedInUser'
            ]);
        return shouldRender;
    }

    _updateManager(event, object) {
        TaskAction.addLoader('designStatus');
        let self = this;
        let { teamMembers, taskId, createdBy, loggedInUser } = self.props;
        let exist = find(teamMembers, (member) => {
            return member._id === object.value;
        });

        if (!exist) {
            teamMembers.push(object.value);
        }
        let updatedTask = {
            id: taskId,
            createdBy: object.value,
            teamMembers: teamMembers
        };
        if (object.value === loggedInUser._id || createdBy === loggedInUser._id) {
            TaskAction.updateLoggedInUser(loggedInUser.id);
        }
        TaskAction.updateManger(updatedTask, Constant.NOTIFICATION_MESSAGES.TASK.MANAGER.UPDATE);
    }

    _updateEngineer(scope, event, object) {
        TaskAction.addLoader('designStatus');
        let self = this;
        let clonedScope = cloneDeep(scope);

        let { teamMembers, taskId, loggedInUser } = self.props;
        let exist = find(teamMembers, (member) => {
            return member._id === object.value;
        });

        if (!exist) {
            teamMembers.push(object.value);
        }

        let updatedTask = {
            id: taskId,
            teamMembers: teamMembers
        };

        let engineerDetails = clonedScope.engineerDetails;
        engineerDetails.engineer = object.value;

        let updatedScope = {
            id: clonedScope.id,
            engineerDetails: engineerDetails
        };

        if (object.value === loggedInUser._id || scope.engineerDetails.engineer.id === loggedInUser.id) {
            TaskAction.updateLoggedInUser(loggedInUser.id);
        }

        TaskAction.updateEngineerDrafter(updatedTask, updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.ASSIGNED.ENGINEER);
    }

    _updateDrafter(scope, event, object) {
        TaskAction.addLoader('designStatus');
        let self = this;
        let clonedScope = cloneDeep(scope);

        let { teamMembers, taskId } = self.props;
        let exist = find(teamMembers, (member) => {
            return member._id === object.value;
        });

        if (!exist) {
            teamMembers.push(object.value);
        }

        let updatedTask = {
            id: taskId,
            teamMembers: teamMembers
        };

        let drafterDetails = clonedScope.drafterDetails;
        drafterDetails.drafter = object.value;

        let updatedScope = {
            id: clonedScope.id,
            drafterDetails: drafterDetails
        };
        if (object.value === self.props.loggedInUser._id || scope.drafterDetails.drafter && scope.drafterDetails.drafter.id === self.props.loggedInUser.id) {
            TaskAction.updateLoggedInUser(self.props.loggedInUser.id);
        }
        TaskAction.updateEngineerDrafter(updatedTask, updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.ASSIGNED.DRAFTER);
    }

    _updateEngineerStatus(scope, event, object) {
        TaskAction.addLoader('designStatus');
        let clonedScope = cloneDeep(scope);
        let engineerDetails = clonedScope.engineerDetails;
        engineerDetails.status = object.value;

        let updatedScope = {
            id: clonedScope.id,
            engineerDetails: engineerDetails
        };
        TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.ENGINEER.STATUS.UPDATE);
    }

    _updateDrafterStatus(scope, event, object) {
        TaskAction.addLoader('designStatus');
        let clonedScope = cloneDeep(scope);
        let drafterDetails = clonedScope.drafterDetails;
        drafterDetails.status = object.value;

        let updatedScope = {
            id: clonedScope.id,
            drafterDetails: drafterDetails
        };
        TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.DRAFTER.STATUS.UPDATE);
    }

    _changeEngineerUrgentHour(scope, event) {
        let clonedScope = cloneDeep(scope);
        TaskAction.changeUrgentHour({
            isDrafter: false,
            scope: clonedScope,
            value: event.target.value
        });
    }

    _updateEngineerUrgentHour(scope, event) {
        let urgentHours = event.target.value.trim();
        let isUrgentHoursUpdatable = true;

        if (!urgentHours) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.REQUIRED, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }

        if (isNaN(urgentHours)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.NOT_A_NUMBER, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }

        urgentHours = parseFloat(urgentHours);

        if (!(urgentHours > 0 && urgentHours < 1000)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }


        if (isUrgentHoursUpdatable) {
            TaskAction.addLoader('designStatus');
            urgentHours = urgentHours.toFixed(2);
            let clonedScope = cloneDeep(scope);
            let hourDetail;
            let updatedScope;

            hourDetail = clonedScope.engineerDetails;
            hourDetail.urgentHours = urgentHours;

            updatedScope = {
                id: clonedScope.id,
                engineerDetails: hourDetail
            };
            if (scope.drafterDetails.drafter && scope.engineerDetails.engineer.id === this.props.loggedInUser.id) {
                TaskAction.updateLoggedInUser(this.props.loggedInUser.id);
            }

            TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.UPDATE);
        }
    }

    _changeDrafterUrgentHour(scope, event) {
        let clonedScope = cloneDeep(scope);
        TaskAction.changeUrgentHour({
            isDrafter: true,
            scope: clonedScope,
            value: event.target.value
        });
    }

    _updateDrafterUrgentHour(scope, event) {
        let urgentHours = event.target.value.trim();
        let isUrgentHoursUpdatable = true;

        if (!urgentHours) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.REQUIRED, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }

        if (isNaN(urgentHours)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.NOT_A_NUMBER, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }

        urgentHours = parseFloat(urgentHours);

        if (!(urgentHours >= 0 && urgentHours < 1000)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }

        if (1 / urgentHours === -Infinity) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isUrgentHoursUpdatable = false;
            return;
        }


        if (isUrgentHoursUpdatable) {
            TaskAction.addLoader('designStatus');
            urgentHours = urgentHours.toFixed(2);
            let clonedScope = cloneDeep(scope);
            let hourDetail;
            let updatedScope;

            hourDetail = clonedScope.drafterDetails;
            hourDetail.urgentHours = urgentHours;

            updatedScope = {
                id: clonedScope.id,
                drafterDetails: hourDetail
            };
            if (scope.drafterDetails.drafter && scope.drafterDetails.drafter.id === this.props.loggedInUser.id) {
                TaskAction.updateLoggedInUser(this.props.loggedInUser.id);
            }

            TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.UPDATE);
        }
    }

    _changeEngineerNonUrgentHour(scope, event) {
        let clonedScope = cloneDeep(scope);
        TaskAction.changeNonUrgentHour({
            isDrafter: false,
            scope: clonedScope,
            value: event.target.value
        });
    }

    _updateEngineerNonUrgentHour(scope, event) {
        let nonUrgentHours = event.target.value.trim();
        let isNonUrgentHoursUpdatable = true;

        if (!nonUrgentHours) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.REQUIRED, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        if (isNaN(nonUrgentHours)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.NOT_A_NUMBER, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        nonUrgentHours = parseFloat(nonUrgentHours);

        if (!(nonUrgentHours > 0 && nonUrgentHours < 1000)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        if (isNonUrgentHoursUpdatable) {
            TaskAction.addLoader('designStatus');
            nonUrgentHours = nonUrgentHours.toFixed(2);
            let cloneScope = cloneDeep(scope);
            let hourDetail;
            let updatedScope;

            hourDetail = cloneScope.engineerDetails;
            hourDetail.nonUrgentHours = nonUrgentHours;

            updatedScope = {
                id: cloneScope.id,
                engineerDetails: hourDetail
            };
            if (scope.drafterDetails.drafter && scope.engineerDetails.engineer.id === this.props.loggedInUser.id) {
                TaskAction.updateLoggedInUser(this.props.loggedInUser.id);
            }

            TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.UPDATE);
        }
    }

    _changeDrafterNonUrgentHour(scope, event) {
        let clonedScope = cloneDeep(scope);
        TaskAction.changeNonUrgentHour({
            isDrafter: true,
            scope: clonedScope,
            value: event.target.value
        });
    }

    _updateDrafterNonUrgentHour(scope, event) {
        let nonUrgentHours = event.target.value.trim();
        let isNonUrgentHoursUpdatable = true;

        if (!nonUrgentHours) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.REQUIRED, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        if (isNaN(nonUrgentHours)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.NOT_A_NUMBER, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        nonUrgentHours = parseFloat(nonUrgentHours);

        if (!(nonUrgentHours >= 0 && nonUrgentHours < 1000)) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        if (1 / nonUrgentHours === -Infinity) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR, level: Constant.NOTIFICATION_LEVELS.ERROR });
            isNonUrgentHoursUpdatable = false;
            return;
        }

        if (isNonUrgentHoursUpdatable) {
            TaskAction.addLoader('designStatus');
            nonUrgentHours = nonUrgentHours.toFixed(2);
            let clonedScope = cloneDeep(scope);
            let hourDetail;
            let updatedScope;

            hourDetail = clonedScope.drafterDetails;
            hourDetail.nonUrgentHours = nonUrgentHours;

            updatedScope = {
                id: clonedScope.id,
                drafterDetails: hourDetail
            };
            if (scope.drafterDetails.drafter && scope.engineerDetails.engineer.id === this.props.loggedInUser.id) {
                TaskAction.updateLoggedInUser(this.props.loggedInUser.id);
            }

            TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.UPDATE);
        }
    }

    _naturalSorter(employeeCode1, employeeCode2) {
        let employeeCode1Match;
        let employeeCode2Match;
        let a1;
        let b1;
        let i = 0;
        let numReturnVal;
        let employeeCode1Length;
        let regexPattern = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
        if (employeeCode1 === employeeCode2) {
            return 0;
        }
        employeeCode1Match = employeeCode1.toLowerCase().match(regexPattern);
        employeeCode2Match = employeeCode2.toLowerCase().match(regexPattern);
        employeeCode1Length = employeeCode1Match.length;
        while (i < employeeCode1Length) {
            if (!employeeCode2Match[i]) {
                return 1;
            }
            a1 = employeeCode1Match[i];
            b1 = employeeCode2Match[i++];
            if (a1 !== b1) {
                numReturnVal = a1 - b1;
                if (!isNaN(numReturnVal)) {
                    return numReturnVal;
                }
                return a1 > b1 ? 1 : -1;
            }
        }
        return employeeCode2Match[i] ? -1 : 0;
    }

    render() {
        let self = this;
        let { teamMembers, scopes, jobNumber, createdBy } = self.props;
        let styles = {
            inlineTextBox: {
                border: 'none',
                width: '45px',
                textAlign: 'center',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                outline: 0
            },
            jobNumber: {
                float: 'right',
                fontSize: '25px'
            }
        };

        let users = cloneDeep(this.props.users);

        users = users.sort((e1, e2) => {
            return self._naturalSorter(e1.employeeCode, e2.employeeCode);
        });

        let projectManager = find(teamMembers, (teamMember) => {
            return teamMember._id === createdBy;
        });

        let managerPopup = (<Popup on='hover' trigger={<Picture avatar src={projectManager.picture} />}
            content={projectManager.firstName + ' ' + projectManager.lastName} />);

        let managers = filter(users, (user) => {
            return user.role.id !== Constant.ROLE_ID.DRAFTER;
        });

        let managerOptions = map(managers, (manager) => {
            return {
                text: manager.firstName + ' ' + manager.lastName,
                value: manager._id
            };
        });

        let data = [];

        data.push(
            <div className={this.props.disabled ? 'modal-bucket-row w-row custom-step-disable' : 'modal-bucket-row w-row'} key='admin-design'>
                <div className='w-clearfix w-col w-col-1'>
                    <Dropdown
                        className='scroll-y '
                        trigger={managerPopup}
                        selectOnBlur={false}
                        options={managerOptions}
                        icon={null}
                        onChange={self._updateManager.bind(self)}
                    />
                </div>
                <div className='w-col w-col-2'>
                    <div className='team-role'>
                        {projectManager.role.name}
                    </div>
                </div>
                <div className='w-col w-col-2'>
                    <div className='team-role'>
                        PM
                    </div>
                </div>
                <div className='w-col w-col-1'>
                    <div className='team-role'>
                        All
                    </div>
                </div>
                <div className='w-col w-col-2'>
                    <div className='team-role'>
                        -
                    </div>
                </div>
                {!this.props.disabled &&
                <div>
                    <div className='w-col w-col-1'>
                        <div className='team-role'>
                            -
                        </div>
                    </div>
                    <div className='w-col w-col-1'>
                        <div className='team-role'>
                            -
                        </div>
                    </div>
                    <div className='w-col w-col-2'>
                        <div className='team-role'>
                            -
                        </div>
                    </div>
                </div>
                }
            </div>
        );

        scopes = sortBy(scopes, (scope) => {
            return scope.createdAt;
        });

        forEach(scopes, (scope, index) => {
            let engineerPopup = (<Popup on='hover' trigger={< Picture avatar src={scope.engineerDetails.engineer.picture} />}
                content={scope.engineerDetails.engineer.firstName + ' ' + scope.engineerDetails.engineer.lastName} />);

            let engineers = filter(users, (user) => {
                return user.role.id === Constant.ROLE_ID.ENGINEER || user.role.id === Constant.ROLE_ID.MANAGER;
            });

            let engineerOptions = map(engineers, (engineer) => {
                return {
                    text: engineer.firstName + ' ' + engineer.lastName,
                    value: engineer._id
                };
            });

            let drafterPopup;
            let drafters;
            let drafterOptions;

            data.push(
                <div key={'engineer-design' + index} className={this.props.disabled ? 'modal-bucket-row w-row custom-step-disable' : 'modal-bucket-row w-row'}>
                    <div className='w-clearfix w-col w-col-1'>
                        <Dropdown className='scroll-y' trigger={engineerPopup} selectOnBlur={false} options={engineerOptions} icon={null}
                            onChange={self._updateEngineer.bind(self, scope)} />
                    </div>
                    <div className='w-col w-col-2'>
                        <div className='team-role'>
                            {scope.engineerDetails.engineer.role && scope.engineerDetails.engineer.role.name}
                        </div>
                    </div>
                    <div className='w-col w-col-2'>
                        <div className='team-role'>
                            AE
                        </div>
                    </div>
                    <div className='w-col w-col-1'>
                        <div className='team-role'>
                            {scope.number}
                        </div>
                    </div>
                    <div className='w-col w-col-2'>
                        <div className='team-role text-ellipsis' style={{ maxWidth: '75%' }}>
                            {scope.note ? scope.note : '-'}
                        </div>
                    </div>
                    {!this.props.disabled &&
                    <div>
                        <div className='w-col w-col-1'>
                            <div className='team-role'>
                                <Dropdown value={scope.engineerDetails.status} selectOnBlur={false} options={Constant.STATUS_OPTIONS_SEMANTIC}
                                          onChange={self._updateEngineerStatus.bind(self, scope)}/>
                            </div>
                        </div>
                        <div className='w-col w-col-1'>
                            <div className='team-role'>
                                <input style={styles.inlineTextBox} value={scope.engineerDetails.urgentHours} onChange={self._changeEngineerUrgentHour.bind(self, scope)}
                                       onBlur={self._updateEngineerUrgentHour.bind(self, scope)}/>
                            </div>
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role'>
                                <input style={styles.inlineTextBox} value={scope.engineerDetails.nonUrgentHours} onChange={self._changeEngineerNonUrgentHour.bind(self, scope)}
                                       onBlur={self._updateEngineerNonUrgentHour.bind(self, scope)}/>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            );

            drafters = filter(users, (user) => {
                return user.role.id === Constant.ROLE_ID.DRAFTER;
            });

            drafterOptions = map(drafters, (drafter) => {
                return {
                    text: drafter.firstName + ' ' + drafter.lastName,
                    value: drafter._id
                };
            });
            if (scope.drafterDetails && scope.drafterDetails.drafter) {
                drafterPopup = (<Popup on='hover' trigger={< Picture avatar src={scope.drafterDetails.drafter.picture} />}
                    content={scope.drafterDetails.drafter.firstName + ' ' + scope.drafterDetails.drafter.lastName} />);

                data.push(
                    <div key={'drafter-design' + index} className={this.props.disabled ? 'modal-bucket-row w-row custom-step-disable' : 'modal-bucket-row w-row'}>
                        <div className='w-clearfix w-col w-col-1'>
                            <Dropdown className='scroll-y' trigger={drafterPopup} selectOnBlur={false} options={drafterOptions} icon={null}
                                onChange={self._updateDrafter.bind(self, scope)} />
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role'>
                                {scope.drafterDetails.drafter.role && scope.drafterDetails.drafter.role.name}
                            </div>
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role'>
                                AD
                            </div>
                        </div>
                        <div className='w-col w-col-1'>
                            <div className='team-role'>
                                {scope.number}
                            </div>
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role text-ellipsis' style={{ maxWidth: '75%' }}>
                                {scope.note ? scope.note : '-'}
                            </div>
                        </div>
                        {!this.props.disabled &&
                        <div>
                            <div className='w-col w-col-1'>
                                <div className='team-role'>
                                    <Dropdown value={scope.drafterDetails.status} selectOnBlur={false} options={Constant.STATUS_OPTIONS_SEMANTIC}
                                              onChange={self._updateDrafterStatus.bind(self, scope)}/>
                                </div>
                            </div>
                            <div className='w-col w-col-1'>
                                <div className='team-role'>
                                    <input style={styles.inlineTextBox} value={scope.drafterDetails.urgentHours} onChange={self._changeDrafterUrgentHour.bind(self, scope)}
                                           onBlur={self._updateDrafterUrgentHour.bind(self, scope)}/>
                                </div>
                            </div>
                            <div className='w-col w-col-2'>
                                <div className='team-role'>
                                    <input style={styles.inlineTextBox} value={scope.drafterDetails.nonUrgentHours} onChange={self._changeDrafterNonUrgentHour.bind(self, scope)}
                                           onBlur={self._updateDrafterNonUrgentHour.bind(self, scope)}/>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                );
            } else {
                drafterPopup = (<Popup on='hover' trigger={< Picture avatar src={null} />}
                    content={'AD'} />);

                data.push(
                    <div key={'drafter-design' + index} className={this.props.disabled ? 'modal-bucket-row w-row custom-step-disable' : 'modal-bucket-row w-row'}>
                        <div className='w-clearfix w-col w-col-1'>
                            <Dropdown trigger={drafterPopup} selectOnBlur={false} options={drafterOptions} icon={null}
                                onChange={self._updateDrafter.bind(self, scope)} />
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role'>
                                -
                            </div>
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role'>
                                AD
                            </div>
                        </div>
                        <div className='w-col w-col-1'>
                            <div className='team-role'>
                                {scope.number}
                            </div>
                        </div>
                        <div className='w-col w-col-2'>
                            <div className='team-role text-ellipsis' style={{ maxWidth: '75%' }}>
                                {scope.note ? scope.note : '-'}
                            </div>
                        </div>
                        {!this.props.disabled &&
                        <div>
                            <div className='w-col w-col-1'>
                                <div className='team-role'>
                                    -
                                </div>
                            </div>
                            <div className='w-col w-col-1'>
                                <div className='team-role'>
                                    -
                                </div>
                            </div>
                            <div className='w-col w-col-2'>
                                <div className='team-role'>
                                    -
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                );
            }
        });

        return (
            <div>
                <div>
                    <div className='modal-section-title'>
                        <span className='fa'></span>
                        <span className='modal-name-field'>Design Allocation</span>
                    </div>
                    <div style={styles.jobNumber}>
                        {jobNumber}
                    </div>
                </div>
                <div className='modal-col-wrap'>
                    <div className='team-role-header'>
                        <div className='w-row'>
                            <div className='w-col w-col-1'>
                                <span>User</span>
                            </div>
                            <div className='w-col w-col-2'>
                                <span>Company Role</span>
                            </div>
                            <div className='w-col w-col-2'>
                                <span>Project Role</span>
                            </div>
                            <div className='w-col w-col-1'>
                                <span>Scope</span>
                            </div>
                            <div className='w-col w-col-2'>
                                <span>Scope Note</span>
                            </div>
                            {!this.props.disabled &&
                                <div>
                                    <div className='w-col w-col-1'>
                                        <span>Status</span>
                                    </div>
                                    <div className='w-col w-col-1'>
                                        <span>Urgent</span>
                                    </div>
                                    <div className='w-col w-col-2'>
                                        <span>Non-Urgent</span>
                                    </div>
                                </div>
                            }

                        </div>
                    </div>
                    {data}
                    <Dimmer inverted active={self.props.isLoading}>
                        <Loader />
                    </Dimmer>
                </div>
            </div>
        );
    }
}

DesignStatus.propTypes = {
    users: PropTypes.array,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool
};
