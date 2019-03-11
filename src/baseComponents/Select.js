import React from 'react';
import isEqual from 'react-fast-compare';
import { Select as SelectAntd } from 'antd';
import PLPPureComponent from './PLPPureComponent';

export class Select extends PLPPureComponent {

    handleChange = (value) => {
        this.props.handleChange(value, this.props.data)
    };

    getStatusOptions = () => this.props.options.map((item, key) => {
        return <SelectAntd.Option value={item.value} key={key}>
            {item.text}
        </SelectAntd.Option>;
    });

    render = () => {
        const { options, data, handleChange, className, label, ...rest } = this.props;
        return <div className={className}>
            {label && <label>{label}</label>}
            <SelectAntd {...rest} onChange={this.handleChange} >
                {this.getStatusOptions()}
            </SelectAntd>
        </div>
    }
}
