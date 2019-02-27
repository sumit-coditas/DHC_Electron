import { Input } from 'antd';
import React from 'react';

import PLPPureComponent from './PLPPureComponent';

export class PLPTextArea extends PLPPureComponent {
    render() {
        const { label, className, required, ...props } = this.props;
        return (
            <div className={className}>
                {label && <label className={'ant-form-item' + `${required ? '-required' : ''}`}>{label}</label>}
                <Input.TextArea {...props} />
            </div>
        );
    }
}
