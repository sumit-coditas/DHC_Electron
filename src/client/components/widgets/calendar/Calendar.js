import React, { Component } from 'react';
import moment from 'moment';
import { Segment } from 'semantic-ui-react';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';

import BigCalendar from 'react-big-calendar';

import CalendarDay from './CalendarDay.js';

import LoginAction from '../../../actions/LoginAction.js';

import LoginStore from '../../../stores/LoginStore.js';

BigCalendar.momentLocalizer(moment);

export default class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        return {
            ...LoginStore.getState()
        }
    }

    onChange(state) {
        this.setState(state);
    }

    componentDidMount() {
        LoginStore.listen(this.onChange);
        LoginAction.toggleCalendarLoading();
        let startDate = moment().startOf('month');
        let endDate = moment().endOf('month');
        LoginAction.getOffice365Events(startDate, endDate);
    }

    componentWillUnmount() {
        LoginStore.unlisten(this.onChange);
    }

    _getPastEvents() {
        LoginAction.toggleCalendarLoading();
        let startDate = this.state.startDate.subtract(7, 'days');
        let endDate = this.state.endDate.subtract(7, 'days');
        LoginAction.getOffice365Events(startDate, endDate);
    }

    _getFutureEvents() {
        LoginAction.toggleCalendarLoading();
        let startDate = this.state.startDate.add(7, 'days');
        let endDate = this.state.endDate.add(7, 'days');
        LoginAction.getOffice365Events(startDate, endDate);
    }

    _onNavigate(date) {
        if(!moment(date).isBetween(moment(this.state.startDate), moment(this.state.endDate))) {
            LoginAction.toggleCalendarLoading();
            let startDate = moment(date).startOf('month');
            let endDate = moment(date).endOf('month');
            LoginAction.getOffice365Events(startDate, endDate);
        }
    }

    render() {
        let self = this;
        let style = {
            navigationIcons: {
                margin: '10px 20px 0px 20px'
            },
            nextIcon: {
                float: 'right'
            }
        };
        let officeEvents = self.state.officeEvents;
        let start = self.state.startDate;
        let end = self.state.endDate;
        let calendarDays = [];

        let events = map(officeEvents, (event) => {
            return({
                title: event.subject,
                start: new Date(event.start.dateTime),
                end: new Date(event.end.dateTime)
            })
        });

        for (let m = cloneDeep(start); m.isBefore(end); m.add(1, 'days')) {
            let date = cloneDeep(m);
            let events = [];
            map(officeEvents, (event) => {
                if (!moment(event.start.dateTime).isSame(moment(event.end.dateTime))) {
                    for (let n = cloneDeep(moment(event.start.dateTime)); n.isBefore(moment(event.end.dateTime)); n.add(1, 'days')) {
                        if (n.isSame(date, 'day')) {
                            events.push(event);
                        }
                    }
                } else if(moment(event.start.dateTime).isSame(date, 'day')) {
                    events.push(event);
                }
            });
            calendarDays.push(<CalendarDay key={date} date={date} events={events} />);
        }

        return (
            <div className="calender-padding" >
                <Segment
                    loading={self.state.isCalendarLoading}
                    className='margin0'
                    disabled={self.state.isCalendarLoading}>
                    <BigCalendar
                        popup = {true}
                        events={events}
                        defaultDate={new Date()}
                        onNavigate={self._onNavigate.bind(self)}
                        className="big-calender"/>
                    {/*<div style={style.navigationIcons}>
                    <Button content='Previous' icon='left arrow' labelPosition='left' onClick={self._getPastEvents.bind(self)} />
                    <Button content='Next' style={style.nextIcon} icon='right arrow' labelPosition='right' onClick={self._getFutureEvents.bind(self)} />
                </div>
                <div className='calendar'>
                    {calendarDays}
                </div>*/}
                </Segment>
            </div>
        );
    }
}
