import { InputNumber } from 'antd';
import React from 'react';

import PLPPureComponent from './PLPPureComponent';

export class PLPPriceInput extends PLPPureComponent {
    render() {
        const { label, className, required, ...rest } = this.props;
        return (
            <div className={className}>
                {label && <label className={'ant-form-item' + `${required ? '-required' : ''}`} style={{ marginBottom: 5 }} >{label}</label>}
                <InputNumber
                    min={0}
                    {...rest}
                    parser={defaultValue => defaultValue.replace(/\$\s?|(,*)/g, '')}
                    formatter={defaultValue => `$ ${defaultValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </div>
        );
    }
}
