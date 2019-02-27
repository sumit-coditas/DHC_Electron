import React, { Component } from 'react';
import { List, Header } from 'semantic-ui-react';
import map from 'lodash/map';

import CalendarEvent from './CalendarEvent.js';

export default class CalendarDay extends Component {
    render() {
        let self = this;
        let { date, events } = self.props;
        let calendarEvents = [];

        map(events, (event, index) => {
            calendarEvents.push(<CalendarEvent key={index} event={event} />);
        });

        return (
            <div>
                <Header as='h3' attached='top' style={{ color: '#07add7' }}>
                    {date.format('dddd, DD-MMM-YY')}
                </Header>
                <List celled>
                    {calendarEvents}
                </List>
            </div>
        );
    }
}
