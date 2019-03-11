import React from 'react';
import PLPPureComponent from './PLPPureComponent';
import { Input, Modal } from 'antd';

export class PLPModal extends PLPPureComponent {
    render() {
        const { children, ...rest } = this.props;
        return (
            <Modal {...rest} >
                {children}
            </Modal>
        );
    }
}
