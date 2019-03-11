import React from 'react';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { connect } from 'react-redux';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { getFormattedNumber } from '../../../utils/common';
import { documentTableHeader } from '../../../utils/constants/ScopeTableHeaders';
import { getFormattedTableData } from './util';
import { PLPDataGrid } from '../../reusableComponents/PLPDataGrid';
import { PLPButton } from '../../../baseComponents/PLPButton';
import Constant from '../../helpers/Constant';

import '../../reusableComponents/scopeTableNew/scopeTableNew.scss';
import { InvoiceForm } from './InvoiceForm';
import { AgreementForm } from './AgreementForm';

class DocumentTableImpl extends PLPPureComponent {

    handleMilestoneClick = (data) => {
        switch (data.type) {
            case Constant.DOC_TYPES.PURCHASE_ORDER.type:
                this.props.handleDocumentClick({ selectedMilestoneId: data.id, showPurchaseOrderForm: true });
                break;
            case Constant.DOC_TYPES.INVOICE.type:
                this.props.handleDocumentClick({ selectedMilestoneId: data.id, selectedTemplate: 'invoice', showCreateMilestone: true });
                break;
            case Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT.type:
                this.props.handleDocumentClick({ selectedMilestoneId: data.id, selectedTemplate: 'agreement', showCreateMilestone: true });
                break;
            case Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT.type:
                this.props.handleDocumentClick({ selectedMilestoneId: data.id, selectedTemplate: 'modifiedAgreement', showCreateMilestone: true });
                break;
            case Constant.DOC_TYPES.MASTER_AGREEMENT.type:
                this.props.handleDocumentClick({ selectedMilestoneId: data.id, selectedTemplate: 'masterAgreement', showCreateMilestone: true });
                break;
            case Constant.DOC_TYPES.CLIENT_AGREEMENT.type:
                this.props.handleDocumentClick({ selectedMilestoneId: data.id, selectedTemplate: 'clientAgreement', showCreateMilestone: true });
                break;
        }
    }

    handleDelete = (data) => {
        this.props.onArchive(data.type, data.sourceData.id, true)
    }

    showPurchaseOrderPopup = (data) => {
        this.props.showPurchaseOrderDetail({ ...data, taskId: this.props.task.id })
    }

    openModalRenderer = (params) => <PLPButton
        data={params.data}
        onClick={this.handleMilestoneClick}>
        {params.value}
    </PLPButton>;

    downloadRender = ({ data }) => {
        const type = data.type
        const milestone = data.sourceData;
        switch (type) {
            case Constant.DOC_TYPES.PURCHASE_ORDER.type:
                return <PLPButton
                    icon='file'
                    data={data}
                    onClick={this.showPurchaseOrderPopup}
                />
            case Constant.DOC_TYPES.INVOICE.type:
                return <InvoiceForm
                    invoice={milestone}
                    task={this.props.task}
                />;
            case Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT.type:
                return <AgreementForm
                    milestone={milestone}
                    type={type}
                    task={this.props.task}
                />;
            case Constant.DOC_TYPES.MASTER_AGREEMENT.type:
            case Constant.DOC_TYPES.CLIENT_AGREEMENT.type:
            case Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT.type:
                return <AgreementForm
                    milestone={milestone}
                    type={type}
                    task={this.props.task}
                    disableClick={true}
                />;
            default: return <div />;
        }
    }

    deleteRender = (params) => <PLPButton
        icon='delete'
        data={params.data}
        onClick={this.handleDelete}
    />

    render = () => <PLPDataGrid
        columnDefs={documentTableHeader}
        rowData={this.props.rowData}
        frameworkComponents={{
            openModalRenderer: this.openModalRenderer,
            downloadRender: this.downloadRender,
            deleteRender: this.deleteRender
        }}
    />
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const selectedTaskFields = {
        id: task.id,
        _id: task._id,
        masterAgreements: task.masterAgreements,
        modifiedAgreements: task.modifiedAgreements,
        purchaseOrders: task.purchaseOrders,
        agreements: task.agreements,
        clientAgreements: task.clientAgreements,
        contractor: task.contractor,
        invoices: task.invoices,
        managetDetails: task.scopes[0] && task.scopes[0].managetDetails
    };

    const rowData = getFormattedTableData(selectedTaskFields);
    return {
        rowData,
        task: selectedTaskFields
    };
}

export const DocumentTable = connect(mapStateToProps)(DocumentTableImpl);
