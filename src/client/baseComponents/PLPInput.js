import React from 'react';
import PLPPureComponent from './PLPPureComponent';
import { Input } from 'antd';

export class PLPInput extends PLPPureComponent {
    render() {
        const { label, className, required, ...props } = this.props;
        return (
            <div className={className}>
                {label && <label className={`${required ? 'ant-form-item-required' : ''}`}>{label}</label>}
                <Input {...props} />
            </div>
        );
    }
}
