import React from 'react';

import { PLPButton } from '../../../baseComponents/PLPButton';
import { PLPInput } from '../../../baseComponents/PLPInput';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { updateMilestone } from '../../../utils/promises/TaskPromises';
import cloneDeep from 'lodash/cloneDeep';

export class InvoiceForm extends PLPPureComponent {

    handleOnClick = () => {
        let invoice = cloneDeep(this.props.invoice);
        invoice.templates.forEach(item => {
            if (item.title.match(/^(Submitted to DHC accounting|Not On Hold|On Hold)$/)) {
                item.isDone = true;
            }
        });
        invoice.selectedScopes.forEach(selectedScope => {
            if (selectedScope.oldPrice !== selectedScope.scope.price) {
                selectedScope.oldPrice = selectedScope.scope.price;
            }
        });
        invoice.isDownloaded = true;

        let milestoneType = 'invoice';

        const payload = {
            taskId: this.props.task.id,
            invoice
        };

        updateMilestone(`${milestoneType}/${invoice.id}`, payload)
            .then(({ data }) => {
                SelectedTaskDetailModel.updateStore(milestoneType, data, SelectedTaskDetailModel.last().props.id);
            });
    };

    render() {
        const { invoice, task } = this.props;
        return (<form action='/api/invoice/download' method='post'>
            <PLPInput type='hidden' name='invoiceId' value={invoice.id} />
            <PLPInput type='hidden' name='taskId' value={task.id} />
            <PLPInput type='hidden' name='poRequired' value={task.contractor.poRequired || task.contractor.poRequired === undefined ? 'yes' : 'no'} />
            <PLPInput type='hidden' name='includeContacts' value={task.contractor.includeContacts ? 'yes' : 'no'} />
            <PLPInput type='hidden' name='contact' value={invoice.contact} />
            <PLPInput type='hidden' name='billBranchFromOutlook' value={task.contractor.billBranch} />
            <PLPInput type='hidden' name='companyNameFromOutlookNotes' value={task.contractor.company} />
            <PLPInput type='hidden' name='invoiceContact' value={task.contractor.invoiceContact} />
            <PLPInput type='hidden' name='clientJobNo' value={task.contractor.includeClientJobNo ? invoice.clientJobNo : ''} />
            <PLPButton htmlType='submit' icon='cloud-download' disabled={invoice.isUpdated ? '' : 'disabled'} onClick={this.handleOnClick} />
        </form>);
    }
}
