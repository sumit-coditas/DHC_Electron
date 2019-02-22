import React from 'react';
import {
    Form,
    Button,
    Message,
    Modal,
    Checkbox,
    Radio,
    Divider,
    Grid,
} from 'semantic-ui-react';
import DatePicker from 'material-ui/DatePicker';
import moment from 'moment';
import debounce from 'lodash/debounce';
import shortid from 'shortid';
import dateFormat from 'dateformat';

import RequestHandler from '../../components/helpers/RequestHandler.js';
import Constant from './../helpers/Constant.js';
import { getTaskNumber } from '../../utils/common.js';
import { getRoundUpHourSpent } from '../../utils/common';

class MultipleHourTracker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            multipleHourTrackers: this.createObjectsForMultipleHourTrackers(),
            taskOptions: [],
            scopeOptions: [],
            fetchingtask: false
        };
    }

    createObjectsForMultipleHourTrackers() {
        const multipleHourTrackers = [];
        for (let i = 0; i < 12; i += 1) {
            multipleHourTrackers.push({
                id: shortid.generate(),
                date: i > 5 ? new Date(moment().add(-1, 'days').startOf('day')) : new Date(moment().startOf('day')),
                scope: '',
                task: '',
                selectedTask: {},
                other: '',
                hoursSpent: '',
                note: '',
                taskOptions: [],
                showOtherOptions: false,
                section: i > 5 ? 'firstHalf' : 'secondHalf'
            });
        }
        return multipleHourTrackers;
    }

    fetchTasks = debounce((event, value, hourtracker) => {
        this.setState({ isFetchingTask: true });
        const data = {
            userId: this.props.userId,
            keyword: value
        };
        let url = 'tasks/user/task_scope';
        RequestHandler.post(url, data)
            .then((tasks) => {
                const multipleHourTrackers = this.state.multipleHourTrackers;
                multipleHourTrackers.find(tracker => tracker.id === hourtracker.id).taskOptions = this.getTaskOptions(tasks);
                this.setState({
                    multipleHourTrackers,
                    isFetchingTask: false
                })
            })
            .catch((e) => { console.log('error', e) });
    }, 500);

    getTaskOptions = (tasks) => tasks.map(task => ({
        key: task._id,
        text: `${getTaskNumber(task)}-${task.title}`,
        value: task._id,
        scopes: task.scopes
    }));

    getScopeOptions = (scopes) => {
        return scopes.map(scope => {
            return {
                key: scope._id,
                text: scope.number + ' - ' + scope.note,
                value: scope._id
            }
        });
    };

    setTaskForHourTracker = (value, hourTracker) => {
        const task = hourTracker.taskOptions.find(task => task.value === value);
        const multipleHourTrackers = this.state.multipleHourTrackers;
        multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).selectedTask = task;
        multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).task = value;
        this.setState({ multipleHourTrackers });
    };

    setScopeForHourTracker = (value, hourTracker) => {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).scope = value;
        this.setState({ multipleHourTrackers });
    };

    toggleOtherOption(hourTracker, checked) {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        // multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).showOtherOptions = checked;
        multipleHourTrackers.map(tracker => {
            if (tracker.id === hourTracker.id) {
                tracker.showOtherOptions = checked;
                tracker.scope = '';
                tracker.task = '';
                tracker.other = '';
            }
        });
        this.setState({ multipleHourTrackers });
    }

    changeOther = (hourTracker, value) => {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).other = value;
        this.setState({ multipleHourTrackers });
    };

    updateNote = (hourTracker, event) => {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).note = event.target.value;
        this.setState({ multipleHourTrackers });
    };

    updateDate(hourTracker, date, type) {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        // multipleHourTrackers.forEach(tracker => tracker.section === type && (tracker.date = new Date(date)));
        multipleHourTrackers.forEach(tracker => tracker.section === type && (tracker.date = date));
        this.setState({ multipleHourTrackers });
    }

    addHourTracker = (hourTracker) => {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        const index = multipleHourTrackers.findIndex(tracker => tracker.id === hourTracker.id);
        let newHourTracker = { ...hourTracker };
        newHourTracker.hoursSpent = '';
        newHourTracker.note = '';
        newHourTracker.id = shortid.generate();
        multipleHourTrackers.splice(index + 1, 0, newHourTracker);
        this.setState({ multipleHourTrackers });
    };

    removeHourTracker = (hourTracker) => {
        const multipleHourTrackers = this.state.multipleHourTrackers;
        const index = multipleHourTrackers.findIndex(tracker => tracker.id === hourTracker.id);
        multipleHourTrackers.splice(index, 1);
        this.setState({ multipleHourTrackers });
    };

    updateHours = (e, value, hourTracker) => {
        let hoursSpent = getRoundUpHourSpent(hourTracker.hoursSpent)(value);
        const multipleHourTrackers = this.state.multipleHourTrackers;
        multipleHourTrackers.find(tracker => tracker.id === hourTracker.id).hoursSpent = hoursSpent;
        this.setState({ multipleHourTrackers }, () => this.forceUpdate());
    };

    formatDate = (date) => dateFormat(date, "mm/d/yy");

    getHourTracker = (hourTracker, type) => {
        return <div key={hourTracker.id}>
            <Form.Group className='hourTrackerRow'>
                <Form.Field width={2}>
                    <DatePicker
                        firstDayOfWeek={0}
                        name={'date' + hourTracker.id}
                        className='date'
                        ref='datePicker'
                        onFocus={this.focusDatePicker}
                        formatDate={this.formatDate}
                        mode='landscape'
                        placeholder='Date'
                        // value={dateFormat(hourTracker.date, "mm/dd/yy")}
                        value={hourTracker.date}
                        onChange={(event, date) => this.updateDate(hourTracker, date, type)}
                    />
                </Form.Field>
                <Form.Field>
                    <Checkbox
                        label='Other'
                        style={styles.checkbox}
                        onChange={(event, { checked }) => this.toggleOtherOption(hourTracker, checked)}
                        name={'checkbox' + hourTracker.id}
                        checked={hourTracker.showOtherOptions}
                    />
                </Form.Field>
                {
                    !hourTracker.showOtherOptions &&
                    <Form.Group className='hourTrackerRow'>
                        <Form.Field>
                            <Form.Dropdown
                                label={false}
                                required
                                placeholder='Type to search task'
                                onChange={(e, { value }) => this.setTaskForHourTracker(value, hourTracker)}
                                value={hourTracker.task}
                                search
                                onSearchChange={(event, value) => this.fetchTasks(event, value, hourTracker)}
                                selection
                                selectOnBlur={false}
                                options={hourTracker.taskOptions}
                                loading={this.state.isFetchingTask && !hourTracker.task}
                                disabled={this.state.isFetchingTask}
                                name={'task' + hourTracker.id}
                                noResultsMessage='Try searching a task'
                            />
                        </Form.Field>
                        <Form.Field>
                            <Form.Dropdown
                                label={false}
                                value={hourTracker.scope}
                                onChange={(e, { value }) => this.setScopeForHourTracker(value, hourTracker)}
                                placeholder='Scope'
                                required
                                selection
                                options={this.getScopeOptions(hourTracker.selectedTask.scopes || [])}
                                name={'scope' + hourTracker.id}
                            />
                        </Form.Field>
                    </Form.Group>
                }
                {
                    hourTracker.showOtherOptions &&
                    <Form.Group className='hourTrackerRow'>
                        <Form.Field>
                            <Radio
                                label={Constant.OTHER_OPTIONS_TIMESHEET.PTO}
                                name={'other' + hourTracker.id}
                                value={Constant.OTHER_OPTIONS_TIMESHEET.PTO}
                                checked={hourTracker.other === Constant.OTHER_OPTIONS_TIMESHEET.PTO}
                                onChange={(event, { value }) => this.changeOther(hourTracker, value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Radio
                                label={Constant.OTHER_OPTIONS_TIMESHEET.HOLIDAY}
                                name={'other' + hourTracker.id}
                                value={Constant.OTHER_OPTIONS_TIMESHEET.HOLIDAY}
                                checked={hourTracker.other === Constant.OTHER_OPTIONS_TIMESHEET.HOLIDAY}
                                onChange={(event, { value }) => this.changeOther(hourTracker, value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Radio
                                label={Constant.OTHER_OPTIONS_TIMESHEET.BIDS}
                                name={'other' + hourTracker.id}
                                value={Constant.OTHER_OPTIONS_TIMESHEET.BIDS}
                                checked={hourTracker.other === Constant.OTHER_OPTIONS_TIMESHEET.BIDS}
                                onChange={(event, { value }) => this.changeOther(hourTracker, value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Radio
                                label={Constant.OTHER_OPTIONS_TIMESHEET.TASKS}
                                name={'other' + hourTracker.id}
                                value={Constant.OTHER_OPTIONS_TIMESHEET.TASKS}
                                checked={hourTracker.other === Constant.OTHER_OPTIONS_TIMESHEET.TASKS}
                                onChange={(event, { value }) => this.changeOther(hourTracker, value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Radio
                                label={Constant.OTHER_OPTIONS_TIMESHEET.DHC}
                                name={'other' + hourTracker.id}
                                value={Constant.OTHER_OPTIONS_TIMESHEET.DHC}
                                checked={hourTracker.other === Constant.OTHER_OPTIONS_TIMESHEET.DHC}
                                onChange={(event, { value }) => this.changeOther(hourTracker, value)}
                            />
                        </Form.Field>
                    </Form.Group>
                }
                <Form.Field style={{ width: '10%', display: 'inline-block' }}>
                    <Form.Input
                        required
                        label={false}
                        type='number'
                        placeholder='Hours'
                        name={'hoursSpent' + hourTracker.id}
                        value={hourTracker.hoursSpent}
                        step="0.25"
                        onChange={(e, { value }) => this.updateHours(e, value, hourTracker)}
                    />
                </Form.Field>
                <Form.Field style={{ width: '17%' }}>
                    <Form.TextArea
                        autoHeight
                        label={false}
                        style={{ maxHeight: '55px' }}
                        placeholder='Notes'
                        name={'note' + hourTracker.id}
                        defaultValue={hourTracker.note}
                        onBlur={event => this.updateNote(hourTracker, event)}
                    />
                </Form.Field>
                <Form.Field className='flex'>
                    <a className='fa add-hourtracker-row'
                        href='#'
                        onClick={() => this.addHourTracker(hourTracker)}
                    >
                        &#xf055;
                    </a>
                    <a className='fa delete-hourtracker-row'
                        href='#'
                        onClick={() => this.removeHourTracker(hourTracker)}
                    >
                        &#xf056;
                    </a>
                </Form.Field>
            </Form.Group>
        </div>
    };

    validateData(formData) {
        let isError = false;
        const multipleHourTrackers = this.state.multipleHourTrackers;
        multipleHourTrackers.forEach((hourTracker) => {
            if (!hourTracker.showOtherOptions) {
                if (!formData['task' + hourTracker.id]) {
                    this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Task is required' });
                    isError = true;
                    return;
                }

                if (!formData['scope' + hourTracker.id]) {
                    this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Scope is required' });
                    isError = true;
                    return;
                }
            } else {
                if (!formData['other' + hourTracker.id]) {
                    this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Other is required' });
                    isError = true;
                    return;
                }
            }
            if (!formData['hoursSpent' + hourTracker.id]) {
                this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Hours are required' });
                isError = true;
                return;
            }
            if (parseFloat(formData['hoursSpent' + hourTracker.id]) <= 0) {
                this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Hours should be greater than 0' });
                isError = true;
                return;
            }

            if (parseFloat(formData['hoursSpent' + hourTracker.id]) >= 1000) {
                this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Hours should be less than 1000' });
                isError = true;
                return;
            }
            if (1 / parseFloat(formData['hoursSpent' + hourTracker.id]) === -Infinity) {
                this.props.handleError({ type: 'bulkHourTracker', errorMsg: 'Hours should be positive value' });
                isError = true;
            }
        });
        return isError;
    }

    handleSubmit = (event, { formData }) => {
        event.preventDefault();
        const multipleHourTrackers = this.state.multipleHourTrackers.reduce((trackers, tracker) => {
            let isBlankRow = false;
            if (!tracker.showOtherOptions) {
                isBlankRow = tracker.task === '' && tracker.scope === '' && tracker.hoursSpent === '';
            } else {
                isBlankRow = tracker.other === '' && tracker.hoursSpent === '';
            }
            !isBlankRow && trackers.push(tracker);
            return trackers;
        }, []);
        this.setState({ multipleHourTrackers }, () => {
            if (!this.validateData(formData)) {
                this.props.handleLoader(true);
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
                this.props.handleUpdate(data);
            }
        });
    };

    getHourTrackerSection = (type) => {
        const hourTrackers = this.state.multipleHourTrackers.filter(hourTrackers => hourTrackers.section === type);
        let total = 0;
        const tracker = hourTrackers.map(hourTracker => {
            total += hourTracker.hoursSpent === '' ? 0 : parseFloat(hourTracker.hoursSpent);
            return this.getHourTracker(hourTracker, type)
        });

        return (
            <div>
                {tracker}
                <div>
                    <Grid columns='equal'>
                        <Grid.Row>
                            <Grid.Column width={9}>
                            </Grid.Column>
                            <Grid.Column floated='right' style={{ fontSize: '17px', paddingTop: '6px' }}>
                                <label>Total Hours Spent : {parseFloat(total).toFixed(2)}</label>
                            </Grid.Column>
                            {type === 'secondHalf' &&
                                <Grid.Column floated='right'>
                                    <Button
                                        primary
                                        type='submit'
                                    >
                                        Submit
                                </Button>
                                    <Button secondary
                                        onClick={this.props.closePopup}
                                    >
                                        Cancel
                                </Button>
                                </Grid.Column>
                            }
                        </Grid.Row>
                    </Grid>
                    <Divider />
                </div>
            </div>
        )
    };

    render() {
        return (
            <Modal size='fullscreen' closeOnDimmerClick open>
                <Modal.Header>
                    Add multiple hour trackers
            </Modal.Header>
                <Modal.Content>
                    {this.props.error && <div className='bulk-hourTracker-error-wrapper'>
                        <Message negative>
                            <Message.Header>
                                {this.props.error}
                            </Message.Header>
                        </Message>
                    </div>
                    }
                    <Form
                        loading={this.props.showLoader}
                        noValidate
                        onSubmit={this.handleSubmit}
                    >
                        {this.getHourTrackerSection('firstHalf')}
                        {this.getHourTrackerSection('secondHalf')}
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
}

export default MultipleHourTracker;

let styles = {
    checkbox: {
        marginBottom: '16px'
    }
};
