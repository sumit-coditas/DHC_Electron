import React, { Component } from 'react';
import { Switch } from 'antd';

class PLPSwitch extends Component {
    handleSwitchChange = (value) => {
        this.props.onChange(value, this.props.data);
    }
    render = () => <Switch disabled={disabled} checked={this.props.checked} onChange={this.handleSwitchChange} />
}

export default PLPSwitch;