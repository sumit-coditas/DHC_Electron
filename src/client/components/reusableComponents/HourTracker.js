import React from 'react';
import {
    Form,
    Button,
    Message,
    Modal,
    Dropdown,
    Checkbox,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import forIn from 'lodash/forIn';
import map from 'lodash/map';
import dateFormat from 'dateformat';


import debounce from 'lodash/debounce';
import DatePicker from 'material-ui/DatePicker';
import moment from 'moment';

import UserAction from '../../actions/UserAction.js';
import UserStore from '../../stores/UserStore.js';
import AppStore from '../../stores/AppStore.js';
import { getSortedScopes, getTaskNumber, getRoundUpHourSpent } from '../../utils/common'

class HourTracker extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            UserStore: UserStore.getState(),
            AppStore: AppStore.getState(),
            isInputChecked: false,
            hourTracker: Object.assign({
                date: '',
                scope: {},
                task: {},
                other: ''
            },
                this.getHourTrackerValue()
            ),
            taskOptions: [],
            userId: props.userId,
            keyword: '',
            date: props.date || ''
        };
    }

    componentDidMount() {
        UserStore.listen(this.onChange);
        AppStore.listen(this.onChange);
    }

    componentWillUnmount() {
        UserStore.unlisten(this.onChange);
        AppStore.unlisten(this.onChange);
    }

    onChange = (state) => {
        const obj = {};
        obj[state.displayName] = state;
        this.setState(obj);
    };

    dateWrapper(date) {
        let inputDate = new Date(date);
        if (inputDate.getFullYear() < 2000) {
            return moment(inputDate).add('years', 100).toDate();
        }
        return new Date(date);
    }

    getHourTrackerValue = () => {
        let obj = {
            id: '',
            _id: '',
            hoursSpent: 0,
            note: ''
        };
        if (this.props.getTask) {
            return obj;
        }
        const { hourTrackers } = this.props.data;
        let copyOfHourTracker = [...hourTrackers];
        let hoursSpent = 0;
        if (copyOfHourTracker.length > 0) {
            copyOfHourTracker.map(hourTracker => {
                if (moment().format('YYYY MM DD') === moment(hourTracker.date).format('YYYY MM DD') &&
                    hourTracker.employee._id === this.props.userId) {
                    obj = {
                        id: hourTracker.id,
                        _id: hourTracker._id,
                        hoursSpent: hourTracker.hoursSpent,
                        note: hourTracker.note
                    };
                }
            });
        }
        return obj;
    };
    updateData = (response) => {
        if (this.props.getTask) {
            let updateData = { ...response };
            this.props.updateHourTracker(updateData);
            return;
        }
        this.handleCancel();
    };

    saveHourTracker = (event, { formData }) => {
        event.preventDefault();
        event.target.blur();
        let { hoursSpent } = this.state.hourTracker;
        if (this.validateHourTrackerForm({ formData })) {
            UserAction.setLoader();
            let data = {};
            data.date = new Date(formData.date).toUTCString();
            data.hoursSpent = parseFloat(hoursSpent).toFixed(2);
            data.note = formData.note;
            data.employee = this.state.userId;
            data.revNumber = formData.revNumber;
            if (formData.otherValue && formData.Checkbox) {
                data.other = formData.otherValue;
            } else {
                data.scope = this.props.getTask ? this.state.hourTracker.scope._id : this.props.data;
                data.task = this.props.getTask ? this.state.hourTracker.task._id : this.props.data.task;
            }
            let selectedTask;
            let selectedScope;
            if (formData.scope) {
                selectedTask = this.props.getTask ? this.state.hourTracker.task : this.props.data.task;
                selectedScope = this.props.getTask ? this.state.hourTracker.scope : this.props.data;
            }

            this.setState({
                hourTracker: {
                    ...this.state.hourTracker,
                    note: data.note,
                    hoursSpent: parseFloat(hoursSpent).toFixed(2),
                    date: data.date,
                    other: data.other || '',
                    task: data.other === '' ? null : selectedTask,
                    scope: data.other === '' ? null : selectedScope
                }
            });

            if (this.state.hourTracker._id !== '') {
                data.id = this.state.hourTracker.id;
                data._id = this.state.hourTracker._id;
                UserAction.updateHourTracker(data);
            } else {
                UserAction.addHourTracker(data, selectedScope, selectedTask, this.updateData, !this.props.getTask);
            }
        }
    };

    handleHourSpentChange = (e, { value }) => {
        let hoursSpent = getRoundUpHourSpent(this.state.hourTracker.hoursSpent)(value);
        this.setState({ hourTracker: { ...this.state.hourTracker, hoursSpent } });
    };

    validateHourTrackerForm({ formData }) {
        let { hoursSpent } = this.state.hourTracker;

        if (parseFloat(hoursSpent) <= 0) {
            UserAction.setError({ type: 'hourTracker', errorMsg: 'Hours should be greater than 0' });
            return false;
        }

        if (formData.date === '' ||
            !hoursSpent ||
            formData.task === '' ||
            formData.scope === '') {
            UserAction.setError({ type: 'hourTracker', errorMsg: 'Please fill all the fields mark with *' });
            return false;
        }

        if (isNaN(hoursSpent)) {
            UserAction.setError({ type: 'hourTracker', errorMsg: 'Hours should be in number' });
            return false;
        }

        if (parseFloat(hoursSpent) >= 1000) {
            UserAction.setError({ type: 'hourTracker', errorMsg: 'Hours should be less than 1000' });
            return false;
        }
        if (1 / parseFloat(hoursSpent) === -Infinity) {
            UserAction.setError({ type: 'hourTracker', errorMsg: 'Hours should be positive value' });
            return false;
        }

        if (!formData.Checkbox) {
            if (!formData.task) {
                UserAction.setError({ type: 'hourTracker', errorMsg: 'Please fill all the fields mark with *' });
                return false;
            }
            if (!formData.scope) {
                UserAction.setError({ type: 'hourTracker', errorMsg: 'Please fill all the fields mark with *' });
                return false;
            }
        } else if (!formData.otherValue) {
            UserAction.setError({ type: 'hourTracker', errorMsg: 'Please fill all the fields mark with *' });
            return false;
        }

        return true;
    }

    handleCancel = () => {
        this.props.closePopUp();
        UserAction.resetError();
        UserAction.toggleTaskView(false);
    };

    updateSelectedTask = (event, selectedOption) => {
        UserAction.updateSelectedTask(selectedOption.value);
        const option = selectedOption.options.find(item => item.key === selectedOption.value);
        this.setState({
            hourTracker: {
                ...this.state.hourTracker,
                task: option.task,
                other: ''
            }
        });
    };

    getUserTask = debounce((event, value) => {
        this.setState({ keyword: value }, () => this.updateTaskList());
    }, 500);

    updateTaskList = () => {
        UserAction.toggleFetchingTask();
        UserAction.getUserTasks(this.state.userId, this.state.keyword)
    };

    toggleTaskView = (event, { checked }) => {
        event.preventDefault();
        this.setState({ isInputChecked: checked });
    };

    handleScopeChange = (event, scopeOptions) => {
        const option = scopeOptions.options.find(item => item.key === scopeOptions.value);
        this.setState({
            hourTracker: {
                ...this.state.hourTracker,
                scope: option.scope,
                other: ''
            }
        });
    };

    getOptionsFromUserState = (userState) => {
        let taskOptions = [];
        forIn(userState.userTasks, (task, key) => {
            let taskNumber;
            if (task) {
                taskNumber = getTaskNumber(task);
            }
            taskOptions.push({
                key: key,
                text: `${taskNumber}-${task.title}`,
                value: key,
                "data-createdAt": task.createdAt,
                taskNumber,
                task: task
            })
        });
        let sortedScopes = getSortedScopes(userState.searchedScopes);
        let scopeOptions = sortedScopes.map(scope => {
            return {
                key: scope._id,
                text: scope.number + ' - ' + scope.note,
                value: scope._id,
                scope: scope
            };
        });
        return { taskOptions, scopeOptions };
    };

    getOptionsFromData = (data) => {
        let taskOptions = [];
        let scopeOptions = [];
        let taskNumber = getTaskNumber(data.task);
        taskOptions.push({
            key: data.task.id,
            text: `${taskNumber}-${data.task.title}`,
            value: data.task.id,
            "data-createdAt": data.task.createdAt,
            taskNumber,
            task: data.task
        });
        scopeOptions.push({
            key: data._id,
            text: data.number + ' - ' + data.note,
            value: data._id,
            scope: data
        });
        return { taskOptions, scopeOptions };
    };

    getTaskList = () => this.state.UserStore.userTasks.map((task, key) => {
        const taskNumber = `${getTaskNumber(task)}-${task.title}`;

        return {
            key: key,
            text: taskNumber,
            value: key,
            "data-createdAt": task.createdAt,
            taskNumber,
            task: task,
            scope: task.scopes
        };
    });

    getScopes = () => getSortedScopes(this.state.UserStore.searchedScopes).map(scope => {
        return {
            key: scope._id,
            text: scope.number + ' - ' + scope.note,
            value: scope._id,
            scope: scope
        };
    });

    getOthers = () => [
        {
            text: '',
            value: '',
            key: 'blank'
        },
        {
            text: 'PTO',
            value: 'PTO',
            key: 'PTO'
        },
        {
            text: 'Holiday',
            value: 'Holiday',
            key: 'Holiday'
        },
        {
            text: 'Bids',
            value: 'Bids',
            key: 'Bids'
        },
        {
            text: 'Tasks',
            value: 'Tasks',
            key: 'Tasks'
        },
        {
            text: 'DHC',
            value: 'DHC',
            key: 'DHC'
        }
    ];

    updateEmployeeId = (event, { value }) => {
        this.setState({ userId: value }, () => {
            if (this.state.keyword !== '') {
                this.updateTaskList();
            }
        });
    };

    formatDate = (date) => dateFormat(date, "m/d/yy");

    render() {
        const { isPersonal, getTask, data } = this.props;
        const { isInputChecked, UserStore } = this.state;
        let { scopeOptions, taskOptions } = getTask ? this.getOptionsFromUserState(UserStore) : this.getOptionsFromData(data);
        let employeeOptions = map(this.state.AppStore.users, (user) => {
            return {
                key: user._id,
                text: user.firstName + ' ' + user.lastName,
                value: user._id
            };
        });
        return (
            <Modal
                open
                size='small'
                closeOnDimmerClick={false}
                closeOnEscape={false}
                closeIcon
                onClose={this.handleCancel}
            >
                <Modal.Header>
                    Hour Tracker
                </Modal.Header>
                <Modal.Content>
                    <Form
                        loading={UserStore.isLoading}
                        noValidate
                        onSubmit={this.saveHourTracker}
                    >
                        {UserStore.error.hourTracker &&
                            <Message negative>
                                <Message.Header>
                                    {UserStore.error.hourTracker}
                                </Message.Header>
                            </Message>
                        }
                        {this.props.getTask && <Checkbox
                            label='Other'
                            style={styles.checkbox}
                            onChange={this.toggleTaskView}
                            name='Checkbox'
                        />}
                        {!isPersonal && <Form.Field>
                            <Form.Dropdown
                                className='tasklist'
                                label='Employee'
                                required
                                selection
                                options={employeeOptions}
                                defaultValue={this.state.userId}
                                name='employee'
                                onChange={this.updateEmployeeId}
                            />
                        </Form.Field>}
                        {isInputChecked ?
                            <Form.Dropdown
                                label='Other'
                                required
                                selection
                                options={this.getOthers()}
                                name='otherValue'
                                defaultValue='blank'
                            /> :
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <label>
                                        Task <span className='form-star-field'> *</span>
                                    </label>
                                    <Dropdown
                                        ref='searchTask'
                                        required
                                        name='task'
                                        placeholder='Type to search task'
                                        onChange={this.updateSelectedTask}
                                        value={getTask ? UserStore.selectedTask : data.task.id}
                                        search
                                        onSearchChange={this.getUserTask}
                                        selection
                                        selectOnBlur={false}
                                        options={getTask ? this.getTaskList() : taskOptions}
                                        loading={UserStore.isFetchingTask}
                                        disabled={getTask ? UserStore.isFetchingTask : true}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    {getTask ?
                                        <Form.Dropdown
                                            label='Scope'
                                            required
                                            selection
                                            options={this.getScopes()}
                                            name='scope'
                                            onChange={this.handleScopeChange}
                                        />
                                        :
                                        <Form.Dropdown
                                            label='Scope'
                                            required
                                            selection
                                            options={scopeOptions}
                                            name='scope'
                                            value={data._id}
                                            onChange={this.handleScopeChange}
                                            disabled={true}
                                        />
                                    }
                                </Form.Field>
                            </Form.Group>
                        }
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <Form.Input
                                    label='Hours'
                                    value={this.state.hourTracker.hoursSpent}
                                    required
                                    name='hoursSpent'
                                    type='number'
                                    min="0"
                                    step='0.25'
                                    onChange={this.handleHourSpentChange}
                                    onKeyUp={this.handleOnKeyPress} />
                            </Form.Field>
                            <Form.Field>
                                <label>Date <span className='form-star-field'> *</span></label>
                                {this.state.date === '' ?
                                    <DatePicker
                                        firstDayOfWeek={0}
                                        hintText='Date'
                                        name='date'
                                        className='date'
                                        ref='datePicker'
                                        // mode='landscape'
                                        // onFocus={this.focusDatePicker}
                                        formatDate={this.formatDate}
                                        value={this.state.date === '' ? new Date() : this.state.date}
                                        onChange={(e, date) => { this.setState({ date }) }}
                                    /> :
                                    <Form.Input
                                        value={this.formatDate(this.state.date)}
                                        name='date'
                                        readOnly
                                    />
                                }
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <Form.TextArea rows="1" label='Notes' name='note' defaultValue={this.state.hourTracker.note} />
                            </Form.Field>
                        </Form.Group>

                        <div className='text-align-right'>
                            <Button
                                primary
                                type='submit'
                            >
                                Submit
                            </Button>
                            <Button
                                secondary
                                onClick={this.handleCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
}

HourTracker.propTypes = {
    getTask: PropTypes.bool,
    data: PropTypes.object
};
HourTracker.defaultProps = {
    getTask: true,
    data: null
};

export default HourTracker;

let styles = {
    checkbox: {
        marginBottom: '16px'
    }
};
