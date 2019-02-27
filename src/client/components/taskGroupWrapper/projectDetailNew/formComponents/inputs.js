import React from 'react';
import { Input, Form, Col, Row, InputNumber, Calendar, Icon } from 'antd';
import { Select } from '../../../../baseComponents/Select';
const { TextArea } = Input;
import DatePicker from '../../../../baseComponents/datepicker';
import VirtualSelect, { PLPVirtualSelectCustom } from '../../../../baseComponents/VirtualSelect';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';

export class TextInput extends PLPPureComponent {
    render() {
        const { offset, span, label, error, required } = this.props;
        return <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            <Input {...this.props} />
        </CustomFormItem>
    }
};

export class TextAreaAntd extends PLPPureComponent {
    render() {
        const { offset, span, label, error, required } = this.props;
        return <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            <TextArea {...this.props} />
        </CustomFormItem>
    }
}

export class PriceInput extends PLPPureComponent {
    onChange = (value) => {
        this.props.onChange(value, this.props.name);
    }
    render() {
        const { offset, span, label, error, required, defaultValue } = this.props;
        return <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            <InputNumber
                min={0}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                defaultValue={defaultValue}
                onChange={this.onChange}
                formatter={defaultValue => `$ ${defaultValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, '')} />
        </CustomFormItem>
    }
};

export class HoursInput extends PLPPureComponent {
    render = () => {
        const { offset, span, label, error, required } = this.props;
        return <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            <InputNumber min={0} max={1000} {...this.props} />
        </CustomFormItem>
    }
}

export class SelectOption extends PLPPureComponent {
    render() {
        const { offset, span, label, error, required } = this.props;
        return <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            <Select {...this.props} />
        </CustomFormItem>
    }
}

export class CustomDatePicker extends PLPPureComponent {
    render() {
        const { offset, span, label, error, required } = this.props;
        return <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            <DatePicker {...this.props} />
        </CustomFormItem>
    }
}

export class CustomFormItem extends PLPPureComponent {
    render() {
        const { offset, span, error, label, required } = this.props
        const labelClass = required && 'ant-form-item-required' || 'ant-form-item-label';

        return (
            <Col offset={offset} span={span || 8}>
                <Form.Item validateStatus={error ? 'error' : ''} help={error} style={{ marginBottom: 10 }}>
                    <label className={labelClass} title="Scope">{label}</label>
                    {this.props.children}
                </Form.Item>
            </Col>
        )
    }
}

export class CustomVirtualSelect extends PLPPureComponent {
    render() {
        const { offset, span, label, error, required } = this.props;
        const sync = this.props.syncIcon ? <Icon className='ant-col-offset-11' type='sync' onClick={this.props.onSync} /> : null;
        const labelClass = required && 'ant-form-item-required ant-col-12' || 'ant-form-item-label ant-col-12';
        return (
            // <CustomFormItem required={required} error={error} offset={offset} span={span} label={label}>
            //     {sync}
            //     <VirtualSelect isClearable={false} backspaceRemoves={false} minimumInput={1} {...this.props} />
            // </CustomFormItem>
            <Col offset={offset} span={span || 8}>
                <Form.Item validateStatus={error ? 'error' : ''} help={error} style={{ marginBottom: 10 }}>
                    <div className="ant-row">
                        <label className={labelClass} title="Scope">{label}</label>
                        {sync}
                    </div>
                    {
                        this.props.custom && <PLPVirtualSelectCustom isClearable={false} backspaceRemoves={false} minimumInput={1} {...this.props} /> ||
                        <VirtualSelect isClearable={false} backspaceRemoves={false} minimumInput={1} {...this.props} />
                    }
                </Form.Item>
            </Col>
        );
    }
}
