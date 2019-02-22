import { InputNumber } from 'antd';
import React from 'react';

import { PLPDatePicker, PLPPureComponent, VirtualSelect } from '../../baseComponents/importer';
import { getRoundUpHourSpent } from '../../utils/common';
import { showWarningNotification } from '../../utils/notifications';

export class HourInput extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        }
    }

    onChange = (data) => {
        let value = getRoundUpHourSpent(this.state.value)(data)
        if (isNaN(value)) {
            value = 0;
        }
        this.setState({ value }, () => {
            if (this.props.handleChange) {
                this.props.handleChange(value);
            }
        });
    }

    onBlur = () => {
        if (this.props.required && this.state.value === 0) {
            this.setState({ value: this.props.value });
            this.props.onBlur(this.props.value);
            if (!this.props.showWarning) {
                showWarningNotification(`Hours can't be 0`)
            }
            return;
        }
        if (this.props.onBlur) {
            this.props.onBlur(this.state.value);
        }
    }


    render() {
        const { autoFocus, label, containerClassName, required, onChange, disabled, value, onBlur, ...rest } = this.props;
        const min = this.props.min && this.props.min || 0
        const max = this.props.max && this.props.max || 1000
        const requiredStr = required ? "-required" : ""
        return (
            <div className={containerClassName}>
                {label && <label className={'ant-form-item' + requiredStr} style={{ marginBottom: 5 }}>{label}</label>}
                <InputNumber
                    step={0.25} min={min} max={max}
                    maxLength={4}
                    formatter={value => {
                        if (`${value}` === '0.00') return value / 1
                        return value;
                    }}
                    {...this.rest}
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onFocus={(e) => {
                        e.target.selectionStart = e.target.value.length
                        e.target.selectionEnd = e.target.value.length
                        this.setState({ value: e.target.value })
                    }}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    tabIndex={this.props.tabIndex}
                />
            </div>
        )
    }
}
export class VirtualSelectWrapper extends PLPPureComponent {
    render() {
        const { label, containerClassName, required, ...props } = this.props;
        return (
            <div className={containerClassName}>
                {label && <label className={'ant-form-item' + `${required ? '-required' : ''}`} style={{ marginBottom: 5 }}>{label}</label>}
                <VirtualSelect {...this.props} />
            </div>
        )
    }
}

export class PLPDatePickerWrapper extends PLPPureComponent {
    render() {
        const { label, containerClassName, required, disabled, ...props } = this.props;
        return (
            <div className={containerClassName}>
                {label && <label className={'ant-form-item' + `${required ? '-required' : ''}`} style={{ marginBottom: 5 }} >{label}</label>}
                <PLPDatePicker disabled={disabled} {...this.props} />
            </div>
        )
    }
}