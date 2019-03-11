import { TimePicker as AntdTimePicker } from 'antd';
import moment from 'moment';
import React from 'react';

import PLPPureComponent from './PLPPureComponent';

export class TimePickerGrid extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value || props.defaultValue
        }
    }

    onOpenChange = (isOpen) => {
        if (!isOpen) {
            this.props.onChange(this.state.value, this.props.data);
        }
    }
    handleChange = (value, format) => {
        event = moment(event).set('seconds', 0).valueOf()
        this.setState({ value });
    }

    render = () => {
        const { onChange, ...rest } = this.props;
        return <AntdTimePicker
            {...rest}
            minuteStep={15}
            onChange={this.handleChange}
            onOpenChange={this.onOpenChange}
        />
    }
}
