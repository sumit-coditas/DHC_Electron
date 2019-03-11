import React from 'react';
import { Button as AntdButton } from 'antd';
import PLPPureComponent from './PLPPureComponent';

export class PLPButton extends PLPPureComponent {
    render = () => <Button {...this.props}/>
}
