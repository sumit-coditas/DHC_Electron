import React from 'react';

import { PLPPureComponent } from '../../../baseComponents/importer';
import { PLPCheckbox } from '../../../baseComponents/PLPCheckbox';
import { PLPInput } from '../../../baseComponents/PLPInput';
import { PLPTextArea } from '../../../baseComponents/PLPTextArea';

export class CSAFormField extends PLPPureComponent {
    render() {
        const { handleCheckBoxClick, form, handleTextValueChange, index } = this.props;
        return (
            <div style={{ padding: '2%' }}>
                <div className='ant-row'>
                    <PLPCheckbox
                        onChange={handleCheckBoxClick}
                        id={index}
                        name='checked'
                        checked={form.checked}
                        className='ant-col-6'
                        data={{ id: index, name: 'checked' }}
                    >
                        {form.checkBoxTitle}
                    </PLPCheckbox>
                    <PLPInput
                        value={form.title}
                        id={index}
                        name='title'
                        onChange={handleTextValueChange}
                        label={form.titleLabel}
                        className='ant-col-6'
                    />
                </div>
                <div style={{ paddingTop: '2%' }}>
                    <PLPTextArea
                        rows={form.rows}
                        value={form.text}
                        id={index}
                        name='text'
                        onChange={handleTextValueChange}
                        label={form.textLabel}
                        className='ant-col-offset-6'
                    />
                </div>
            </div>
        );
    }
}
