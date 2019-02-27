import React, { Component } from 'react';
import { List } from 'semantic-ui-react';
import moment from 'moment';

export default class CalendarEvent extends Component {
    render() {
        let self = this;
        let { event } = self.props;

        let backgroundColor = '';
        if (event.categories.length) {
            backgroundColor = event.categories[0].split(' ')[0];
        }

        return (
            <List.Item style={{ background: backgroundColor }}>
                <List.Icon name='calendar' size='large' verticalAlign='middle' />
                <List.Content>
                    <List.Header>{event.subject}</List.Header>
                    <List.Description>{moment(new Date(event.start.dateTime)).format('hh:mm a')}
                        - {moment(new Date(event.end.dateTime)).format('hh:mm a')}</List.Description>
                </List.Content>
            </List.Item>
        );
    }
}
