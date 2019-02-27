import React from 'react';
import PLPPureComponent from './PLPPureComponent';
import { Checkbox } from 'antd';

export class PLPCheckbox extends PLPPureComponent {

    handleChannge = (e) => {
        this.props.onChange(e.target.checked, this.props.data);
    }
    render() {
        const { label, ClassName, required, ...props } = this.props;
        return (
            <div className={ClassName}>
                <Checkbox {...props} onChange={this.handleChannge} />
                {label && <label className={'ant-form-item' + `${required ? '-required' : ''}`} style={{ marginLeft: 5, display: 'inline' }} >{label}</label>}
            </div>
        );
    }
}
