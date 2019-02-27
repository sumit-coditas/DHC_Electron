import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import PLPPureComponent from './PLPPureComponent';
import { PLPDATE_FORMAT } from '../utils/constant';

class CustomDatepicker extends PLPPureComponent {
    render() {
        const { defaultValue, onChange, className, data, disabledDate, disabled, ...rest } = this.props;
        return (
            <DatePicker
                className={className || 'dueDatePicker'}
                defaultValue={moment(defaultValue)}
                onChange={(changedValue) =>onChange(changedValue, data)}
                format={PLPDATE_FORMAT}
                autoFocus={false}
                disabledDate={disabledDate}
                disabled={disabled}
                {...rest}
            />
        )
    }
}

export default CustomDatepicker;
