import { TimePicker as AntdTimePicker } from 'antd';
import moment from 'moment';
import React from 'react';

import PLPPureComponent from './PLPPureComponent';

export class TimePicker extends PLPPureComponent {
    handleChange = (event, format) => {
        event = moment(event).set('seconds', 0).valueOf()
        this.props.onChange(event, this.props.data)
    }

    render = () => <AntdTimePicker {...this.props} minuteStep={15} onChange={this.handleChange} />
}
