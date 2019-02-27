
import React from 'react';
import moment from 'moment';

export default class Timestamp extends React.Component {

    getTime = () => {
        const { date } = this.props;
        if (!date) {
            return '';
        }
        let duration = moment.duration(moment().diff(date));
        let timestamp;
        if (duration.asDays() < 1) {
            if (parseInt(duration.asMinutes()) === 0) {
                timestamp = 'Just Now';
            } else if (parseInt(duration.asHours()) === 0) {
                timestamp = parseInt(duration.asMinutes()) + ' minutes ago';
            } else {
                timestamp = parseInt(duration.asHours()) + ' hours ago';
            }
        } else if (duration.asDays() < 2) {
            timestamp = 'Yesterday';
        } else {
            timestamp = moment(date).format('M/D/YY');
        }
        return timestamp;
    };

    render() {
        return (
            <div>
                {this.getTime()}
            </div>
        );
    }
}
