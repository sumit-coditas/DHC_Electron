import React from 'react';
import PLPPureComponent from './PLPPureComponent';
import { Menu } from 'antd';

export class PLPMenu extends PLPPureComponent {
    render() {
        const { children, ...rest } = this.props;
        return (
            <Menu {...rest} >
                {children}
            </Menu>
        );
    }
}

export class PLPMenuItem extends PLPPureComponent {
    render() {
        return (
            <Menu.Item {...this.props} />
        );
    }
}
