import React from 'react';
import PLPPureComponent from './PLPPureComponent';
import { Button } from 'antd';

export class PLPButton extends PLPPureComponent {

    onClick = () => {
        this.props.onClick(this.props.data || '');
    }

    render() {
        const { onClick, data, ...props } = this.props;
        return <Button {...props} onClick={this.onClick} />
    }
}
