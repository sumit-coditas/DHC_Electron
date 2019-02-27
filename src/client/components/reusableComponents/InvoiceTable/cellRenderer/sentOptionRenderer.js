import React, { Component } from 'react';
import { InvoiceModel } from '../../../../model/InvoiceModel/InvoiceModel';
import { showWarningNotification, showFaliureNotification, showSuccessNotification } from '../../../../utils/notifications';
import { FIELDS } from '../../../../utils/constants/ScopeTableFields';
import { updateInvoice } from '../../../../utils/promises/invoicePromises';
import { SENT_PAID_OPTIONS } from '../Constants';
import { Select } from '../../../../baseComponents/Select';
import { taskID } from '../../TaskGroupDropdown/Constants';




class SentOptionRenderer extends Component {

    resetInvoice = (id) => {
        InvoiceModel.resetInvoice(id);
    };

    changeHoldStatus = (value, data) => {
        let { id, templates, taskID } = data;
        let payload = {
            taskId: taskID
        };
        if (value === 'Y' && data.sent === 'Y') {
            templates.find(template => template.title === 'On Hold').isDone = false;
            payload.invoice = {
                hold: value,
                sent: 'N',
                id,
                templates,
                // taskID
            }
        } else {
            payload.invoice = {
                hold: value,
                id
            }
        }
        this.updateInvoice(payload, 'hold  status');
    };

    changeSentStatus = (value, data) => {
        let { id, templates, taskID, hold } = data;
        let payload = {
            taskId: taskID
        };
        templates.find(template => template.title === 'Submitted to customer').isDone = true;
        if (value === 'Y' && hold === 'Y') {
            payload.invoice = {
                id,
                templates,
                // taskID,
                sent: 'Y',
                hold: 'N',
                sentDate: new Date()
            }
        } else if (value === 'Y' && hold !== 'Y') {
            payload.invoice = {
                id,
                templates,
                // taskID,
                sent: 'Y',
                sentDate: new Date()
            }
        } else {
            templates.find(template => template.title === 'Submitted to customer').isDone = false;
            payload.invoice = {
                id,
                templates,
                // taskID,
                sent: value,
                sentDate: null
            }
        }
        this.updateInvoice(payload, 'sent status');
    };

    changePaidStatus = (value, data) => {
        let { id, templates, taskID } = data;
        let payload = {
            taskId: taskID
        };
        templates.find(template => template.title === 'Paid').isDone = value === 'Y';
        payload.invoice = {
            id,
            templates,
            taskID,
            paid: value,
            paidDate: value === 'Y' ? new Date() : null
        };
        this.updateInvoice(payload, 'paid status');
        // console.log(payload);
    };

    updateInvoice = (payload, field) => {
        updateInvoice(payload).then(data => {
            let existingInvoice = InvoiceModel.get(data.id);
            existingInvoice.props = { ...existingInvoice.props, ...data };
            new InvoiceModel(existingInvoice.props).$save(),
                showSuccessNotification(`Invoice updated successfully.`);
        }).catch(e => {
            showFaliureNotification(`Faild to update ${field} field`);
        })
    };

    handleStatusChange = (value, { data, colDef, node }) => {
        if (value === '-') {
            this.resetInvoice(data.id);
            showWarningNotification('Please select Y or N as hold status.');
            return;
        }
        switch (colDef.field) {
            case FIELDS.INV_HOLD:
                this.changeHoldStatus(value, data, node);
                break;
            case FIELDS.INV_SENT:
                this.changeSentStatus(value, data, node);
                break;
            case FIELDS.INV_PAID:
                this.changePaidStatus(value, data, node);
                break;
        }
    };

    render() {
        const params = this.props
        return <Select
            defaultValue={params.value}
            extra={params.data}
            handleChange={(e) => this.handleStatusChange(e, params)}
            className='table-select'
            dropdownClassName='select-options'
            options={SENT_PAID_OPTIONS}
        />;
    }
}

export default SentOptionRenderer;