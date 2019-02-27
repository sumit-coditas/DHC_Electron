import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import './addHour.scss';

import { PLPCheckbox, PLPInput, PLPPureComponent } from '../../../baseComponents/importer';
import { HourTrackerModel } from '../../../model/AppModels/HourTrackerModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { UserModel } from '../../../model/UserModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { getTaskNumber } from '../../../utils/common';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';
import { disabledDate, enableAllDate, getStartDateOfDay } from '../../../utils/DateUtils';
import {
    addHourRecord,
    addHourToScope,
    removeHourFromScope,
    searchTask,
    updateHourtracker,
} from '../../../utils/promises/TaskPromises';
import { getTodaysLoggedHoursOfUser } from '../../../utils/promises/UserPromises';
import { isEmptyString } from '../../../utils/Validation';
import EngineerList from '../../reusableComponents/roleDropDown/engineer.js';
import { isNumber } from '../../taskGroupWrapper/projectDetailNew/util';
import { getScopeList } from '../util';
import { HourInput, PLPDatePickerWrapper, VirtualSelectWrapper } from '../wrapperComponents';
import { OTHER_OPTIONS } from './service';
import sortBy from 'lodash/sortBy'

class AddHourtrackerFormImpl extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            otherCheckbox: false,
            scopeOptions: this.getInitialScopeList(props.selectedScope),
            selectedScope: props.selectedScope && props.selectedScope.id || null,
            selectedTask: props.selectedScope && props.selectedScope.task.id || null,
            hourtracker: props.hourtracker || this.getNewHourTracker(props)
        }
    }

    getNewHourTracker = (props) => ({
        date: getStartDateOfDay(props.selectedDate) || getStartDateOfDay(),
        other: '',
        selectedOther: null,
        employee: props.loggedInUserId,
        note: '',
        otherCheckbox: false,
        hoursSpent: 0
    });

    getInitialScopeList(selectedScope) {
        if (!selectedScope) return null;
        return [{
            label: `${selectedScope.scope} - ${selectedScope.scopeNote}`,
            value: selectedScope.id
        }];
    }

    getTaskDisabledOptions = (selectedScope) => {
        if (!selectedScope) return null;
        return [{
            label: getTaskNumber(selectedScope.task),
            value: selectedScope.task.id
        }];
    }

    handleSubmit = () => {
        if (this.props.hourtracker) {
            this.updateHourtracker();
        } else {
            this.addHourtracker();
        }
    }

    async addHourtracker() { //add to scopmodel is scope selected, will add to hourmodel
        try {
            let result = ''
            this.setState({ loading: true });
            let hourtracker = await addHourRecord(this.state.hourtracker);
            if (this.state.selectedScope) {
                const scope = await addHourToScope(this.state.selectedScope, hourtracker);
                ScopeModel.addHourToScope(scope, this.props.taskId);
                hourtracker.task = this.state.selectedTask
                hourtracker.scope = this.state.scopeOptions && this.state.scopeOptions.find(scope => scope.id === this.state.selectedScope)
                    || this.props.task && this.props.task.scopes.find(scope => scope.id === this.state.selectedScope)
                    || this.state.selectedScope
            }
            HourTrackerModel.addHour(hourtracker);
            await getTodaysLoggedHoursOfUser(this.props.loggedInUserId);
            this.togglePopup(hourtracker);
        } catch (e) {
            this.setState({ loading: false });
        }
    }

    async updateHourtracker() {
        const { selectedTask, selectedScope, hourtracker } = this.state;
        try {
            let scope = null;
            this.setState({ loading: true });
            const { data } = await updateHourtracker(hourtracker);
            HourTrackerModel.updateHour(data);
            if (this.props.selectedScope.id !== selectedScope) {
                const oldScope = await removeHourFromScope(this.props.selectedScope.id, { hourtrackerId: data._id });
                scope = await addHourToScope(this.state.selectedScope, data);
                ScopeModel.removeHourFromScope(scope, selectedTask);
            }
            if (scope) {
                ScopeModel.addHourToScope(scope, selectedTask);
            } else {
                ScopeModel.addHourToScope({
                    id: this.state.selectedScope,
                    hourtracker: data
                }, selectedTask);
            }
            await getTodaysLoggedHoursOfUser(this.props.loggedInUserId);
            this.togglePopup();
        } catch (e) {
            console.log('error', e)
            this.setState({ loading: false });
        }
    }

    isInvalidForm = () => {
        let hourtracker = this.state.hourtracker

        // return hourtracker.date && isNumber(hourtracker.hoursSpent) && hourtracker.hoursSpent > 0;
        const dateError = hourtracker.date ? null : 'Date Not Selected'
        const hourError = isNumber(hourtracker.hoursSpent) && hourtracker.hoursSpent > 0 ? null : 'Hour not Added'
        // const otherError = isEmptyString(hourtracker.other) ? 'Other Not Selected' : null
        // const scopeError = isEmptyString(this.state.selectedScope) ? 'Scope Not Selected' : null
        // const isScopeOrOtherError = otherError ? otherError : scopeError ? 'Select Scope or Other' :  null
        const isScopeOrOtherError = isEmptyString(this.state.selectedScope) && isEmptyString(hourtracker.other) && 'Select Scope or Other' || null
        const employeeError = hourtracker.employee || this.props.loggedInUserId ? null : 'Select Employee'
        return !dateError && !hourError && !isScopeOrOtherError && !employeeError

    }

    handleChange = (value, field) => {
        if (field === 'otherCheckbox') { // reset values on Other checkbox change
            const selectedScope = this.props.selectedScope && props.selectedScope.id || null;
            const selectedTask = this.props.selectedTask && props.selectedTask.id || null;
            const hourtracker = {
                ...this.state.hourtracker,
                other: '',
                [field]: value
            }
            this.setState({ selectedScope, selectedTask, hourtracker });
            return
        }
        const hourtracker = { ... this.state.hourtracker }
        hourtracker[field] = value
        this.setState({ hourtracker });
    }

    togglePopup = (scope = {}) => {
        this.setState({ loading: false });
        this.props.togglePopup({ showAddHourTrackerForm: false }, scope)
    }

    handleHourChange = (value) => {
        this.updateHourtrackerField(value, 'hoursSpent');
    }

    handleScopeChange = (selected) => {
        this.setState({ selectedScope: selected.value });
    }


    handleTaskChange = (selected) => {
      if(selected && selected.scopes){
        let scopes = [...selected.scopes];
        const sortedScopes = sortBy(scopes, 'number');
        this.setState({ scopeOptions: sortedScopes, selectedTask: selected });
      }
    }

    handleNoteChange = (e) => {
        const value = e.target.value;
        this.handleChange(value, 'note');
    }

    handleTaskSearch = async (query) => {
        let searchedTask = []
        if (query) {
            const userId = this.props.loggedInUserId;
            const keyword = query
            const options = await searchTask({ userId, keyword });
            options.forEach(element => {
                element.scopes.forEach(scope => {
                    scope.label = `${scope.number} - ${scope.note}`;
                    scope.value = `${scope.id}`;
                    return scope;
                })
                element.label = `${getTaskNumber(element)} ${element.title}`;
                element.value = element.id;
                return element
            });
            return { options }
        }
    }

    updateHourtrackerField = (value, field) => {
        if (field === 'date') {
            value = getStartDateOfDay(value)
        }
        this.setState({ hourtracker: { ...this.state.hourtracker, [field]: value } });
    }

    handleOtherChange = (data) => {
        this.updateHourtrackerField(data.value, 'other');
    }

    render() {
        const { error, loading, hourtracker } = this.state;
        const { taskModelScopes, showOther, showScope, disableTask, disableScope, showTask, selectedScope, showEmployees } = this.props;
        const defaultValue = this.props.selectedDate || hourtracker.date;
        return (<Modal
            visible
            width='650px'
            onCancel={this.togglePopup}
            onOk={this.handleSubmit}
            confirmLoading={loading}
            title='Hour Tracker'
            cancelButtonProps={{ className: 'cancel-btn-right', tabIndex: 8 }}
            okButtonProps={{ tabIndex: 7, disabled: !this.isInvalidForm(), style: changeSubmitButtonStyle(loading) }}
            okText='Submit'
        >
            <Row gutter={16} >
                {showOther &&
                    <Col className="gutter-row margin-bottom10" span={12}>
                        <PLPCheckbox
                            tabIndex={1}
                            containerClassName="gutter-box"
                            label="Other"
                            data="otherCheckbox"
                            onChange={this.handleChange}
                        />
                    </Col>
                }
            </Row>
            <Row gutter={16}>
                {showOther && showEmployees &&
                    <Col className="gutter-row" span={12}>
                        <EngineerList
                            tabIndex={2}
                            containerClassName='gutter-box'
                            label="Employee"
                            required={true}
                            data={"employee"}
                            onChange={this.handleChange}
                            defaultValue={hourtracker.employee}
                        />
                    </Col>
                }

                {showOther && hourtracker.otherCheckbox &&
                    <Col className="gutter-row" span={12}>
                        <VirtualSelectWrapper
                            label="Other"
                            required={true}
                            tabIndex={3}
                            containerClassName='gutter-box'
                            onChange={this.handleOtherChange}
                            value={hourtracker.other}
                            options={OTHER_OPTIONS}
                        />
                    </Col>
                }
            </Row>
            <Row gutter={16}>
                {((showOther && !hourtracker.otherCheckbox) || showTask) && !disableTask &&
                    <Col className="gutter-row" span={12}>
                        <VirtualSelectWrapper
                            label="Task"
                            required
                            tabIndex={3}
                            containerClassName='gutter-box'
                            async
                            onChange={this.handleTaskChange}
                            value={this.state.selectedTask}
                            loadOptions={this.handleTaskSearch}
                        />
                    </Col>
                }

                {((showOther && !hourtracker.otherCheckbox) || showTask) && disableTask &&       // show task dropdown
                    <Col className="gutter-row" span={12}>
                        <VirtualSelectWrapper
                            label="Task"
                            required
                            isDisabled
                            containerClassName='gutter-box'
                            value={this.state.selectedTask}
                            options={this.getTaskDisabledOptions(selectedScope)}
                        />
                    </Col>
                }
                {((showOther && !hourtracker.otherCheckbox) || showScope) &&         // show scope dropdown
                    <Col className="gutter-row" span={12}>
                        <VirtualSelectWrapper
                            label="Scope"
                            required
                            tabIndex={4}
                            containerClassName='gutter-box'
                            isDisabled={disableScope}
                            onChange={this.handleScopeChange}
                            value={this.state.selectedScope}
                            options={this.state.scopeOptions || taskModelScopes}
                        />
                    </Col>
                }
            </Row>
            <Row gutter={16}>
                <Col className="gutter-row" span={12}>
                    <PLPDatePickerWrapper
                        label="Date"
                        required
                        tabIndex={5}
                        containerClassName='gutter-box'
                        disabledDate={this.props.enableAllDate && enableAllDate || disabledDate}
                        data="date"
                        defaultValue={moment(this.props.selectedDate || hourtracker.date)}
                        value={moment(this.props.selectedDate && this.props.selectedDate || hourtracker.date)} // parsed incoming string or date to moment
                        disabled={this.props.disabledDatePicker}
                        onChange={this.updateHourtrackerField}
                    />
                </Col>
                <Col className="gutter-row" span={12}>
                    <HourInput
                        label="Hours"
                        showWarning={true}
                        autoFocus={this.props.focusHours}
                        name="hoursSpent"
                        containerClassName='gutter-box'
                        required={true}
                        onBlur={() => { }}
                        tabIndex={6}
                        value={hourtracker.hoursSpent}
                        handleChange={this.handleHourChange}
                    />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col className="gutter-row" span={12}>
                    <PLPInput
                        label="Note"
                        name="note"
                        containerClassName="gutter-box"
                        onBlur={this.handleNoteChange}
                        defaultValue={hourtracker.note}
                    />
                </Col>
            </Row>
        </Modal >);
    }
}

function mapStateToProps(state, ownProps) {
    if (ownProps.selectedScope) {
        return {
        };
    }
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0]
    return {
        taskId: task && task.id,
        task,
        taskModelScopes: task && getScopeList(task.scopes),
        loggedInUserId: UserModel.last().props._id
    }
}

export const AddHourtrackerForm = connect(mapStateToProps)(AddHourtrackerFormImpl);
