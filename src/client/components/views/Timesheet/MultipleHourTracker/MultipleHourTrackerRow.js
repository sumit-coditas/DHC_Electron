import React from 'react';
import {
    Row,
    Col,
    Icon,
    Radio
} from 'antd';
const RadioGroup = Radio.Group;
import moment from 'moment';

import { searchTask } from '../../../../utils/promises/TaskPromises';

import {
    PLPPureComponent,
    PLPDatePicker,
    PLPCheckbox,
    VirtualSelect,
    PLPInput
} from '../../../../baseComponents/importer';

import { getTaskNumber } from '../../../../utils/common';

import { disabledDate, enableAllDate } from '../../../../utils/DateUtils';
import Constants from '../../../helpers/Constant';
import { HourInput } from '../../../hourTracker/wrapperComponents';

const otherValues = {
    'PTO': 1,
    'Holiday': 2,
    'Bids': 3,
    'Tasks': 4,
    'DHC': 5
}
export class MultipleHourTrackerRow extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isOtherChecked: false,
            note: props.note,
            hoursSpent: props.hoursSpent
        };
    }

    handleDateChange = (changedDate) => {
        this.handleChange('date', changedDate);
    }

    toggleOtherCheckbox = (value, field) => {
        this.handleChange(field, value);
    }

    handleOtherChange = (e) => {
        this.handleChange('other', Object.entries(otherValues).find(entries => entries[1] === e.target.value)[0]);
    }

    handleTaskSearch = async (query) => {
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

    handleTaskChange = (selected) => {
        if (selected) {
            const scopes = [...selected.scopes];
            const task = {
                label: selected.label,
                value: selected.value
            }
            this.props.handleTaskChange({ scopeOptions: scopes, selectedTask: task, id: this.props.id });
        } else {
            this.props.handleTaskChange({ scopeOptions: [], selectedTask: null, id: this.props.id });
        }
    }

    handleScopeChange = (selected) => {
        this.handleChange('scope', selected);
    }

    handleHourChange = (e, a) => {
        this.setState({hoursSpent: e});
    }

    handleHourUpdate = (e, a) => {
        this.handleChange('hoursSpent', e);
    }

    handleNoteChange = (e) => {
        this.setState({note: e.target.value});
    }

    handleNoteUpdate = (e) => {
        this.handleChange('note', e.target.value.trim())
    }

    handleChange = (field, value) => {
        this.props.handleChange(this.props.id, field, value);
    }

    render() {
        const { id, date, scope, task, other, section, addRow, removeRow , scopeOptions, showOtherOptions }  = this.props;
        return (
            <div className='hourtracker-row'>
                <Row type='flex' justify='space-between'>
                    <Col span={3}>
                        <PLPDatePicker
                            disabledDate={enableAllDate}
                            value={moment(date)}
                            data={section}
                            onChange={this.props.handleDateChange}
                            enableAllDate={true}

                        />
                    </Col>
                    <Col span={2} className='multiple-hours-checkbox-wrapper'>
                        <PLPCheckbox
                            className='multiple-hours-checkbox'
                            label='Other'
                            data='showOtherOptions'
                            value={showOtherOptions}
                            onChange={this.toggleOtherCheckbox}
                        />
                    </Col>
                    {
                        !showOtherOptions
                        ?
                            <Col span={8}>
                                <Row type='flex' justify='space-between' gutter={16}>
                                    <Col span={12}>
                                        <VirtualSelect
                                            async
                                            value={task}
                                            loadOptions={this.handleTaskSearch}
                                            placeholder='Search Task'
                                            onChange={this.handleTaskChange}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <VirtualSelect
                                            onChange={this.handleScopeChange}
                                            value={scope}
                                            options={scopeOptions}
                                            isDisabled={!task}
                                            placeholder='Select Scope'
                                        />
                                    </Col>
                                </Row>
                            </Col>   
                        :
                            <Col span={8} style={{ alignSelf: 'center' }}>
                                <Row type='flex' justify='space-between'>
                                    <RadioGroup
                                        name='other'
                                        value={otherValues[other]}
                                        onChange={this.handleOtherChange}
                                    >
                                        <Radio value={1}>{Constants.OTHER_OPTIONS_TIMESHEET.PTO}</Radio>
                                        <Radio value={2}>{Constants.OTHER_OPTIONS_TIMESHEET.HOLIDAY}</Radio>
                                        <Radio value={3}>{Constants.OTHER_OPTIONS_TIMESHEET.BIDS}</Radio>
                                        <Radio value={4}>{Constants.OTHER_OPTIONS_TIMESHEET.TASKS}</Radio>
                                        <Radio value={5}>{Constants.OTHER_OPTIONS_TIMESHEET.DHC}</Radio>
                                    </RadioGroup>
                                </Row>
                            </Col>
                    }
                    <Col span={2}>
                        <HourInput
                            step={0.25} max={23}
                            value={this.state.hoursSpent}
                            onBlur={this.handleHourUpdate}
                            onChange={this.handleHourChange}
                            name='hoursSpent'
                            placeholder='Hours'
                        />
                    </Col>
                    <Col span={4}>
                        <PLPInput
                            name='note'
                            onBlur={this.handleNoteUpdate}
                            onChange={this.handleNoteChange}
                            value={this.state.note}
                        />
                    </Col>
                    <Col span={2} className='filled-icons-wrapper'>
                        <div>
                            <Icon
                                className='filled-icon'
                                type='plus-circle'
                                theme='filled'
                                onClick={() => addRow(id)}
                            />
                            <Icon
                                className='filled-icon'
                                type='minus-circle'
                                theme='filled'
                                onClick={() => removeRow(id)}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
