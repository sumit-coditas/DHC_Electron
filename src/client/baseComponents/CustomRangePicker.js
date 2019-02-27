import React from 'react';
import { DatePicker } from 'antd';
import PLPPureComponent from './PLPPureComponent';

const { RangePicker } = DatePicker;

class CustomRangePicker extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            endOpen: false
        };
    }

    render() {
    const { value, mode, onPanelChange, ...rest } = this.props;
    return ( <RangePicker
        value={value}
        mode={mode}
        onPanelChange={onPanelChange}
        {...rest}
        popupStyle={{
            width: '24em'
        }}
    />);
    }
}

export default CustomRangePicker;
