import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Button, Modal } from 'antd';
import isEqual from 'react-fast-compare';
import Constant from '../../helpers/Constant';
import { groupScopeRelatedMilestones } from '../scopeTableNew/ScopeTableUtils';
import '../../views/TaskPage/styles/ScopeDetailsStyle.scss'
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';

class ArchivedMilestoneImpl extends PLPPureComponent {

    restoreMilestone = (event) => {
        if(this.props.unEditable) return;
        this.props.handleArchive(event.target.value, event.target.id, false);
    };

    togglePopup = (event) => {
        this.props.togglePopup({ target: { id: 'showArchivedMilestones', value: false } });
    };

    getArchieveMilestone = (milestone, { title, type }) => <div className="archived-modal-row border-bottom" id={milestone.id}>
        <div className='width-33'> {`${title} ${milestone.number}`}</div>
        <div className='width-33'> {milestone.scopeNumber || ''}</div>
        <Button className="width-33 restore-btn" type="warning" icon="undo" value={type} id={milestone.id} onClick={this.restoreMilestone} disabled={this.props.unEditable} >Restore</Button>
    </div>;

    render = () => {
        const { agreements, modifiedAgreements, masterAgreements,
            clientAgreements, purchaseOrders, invoices, calcs, drawings,custDrawings, tabData, letters } = this.props;
        return <Modal
            title="Archived Milestones"
            visible
            centered
            id='archived_milestone_modal'
            onCancel={this.togglePopup}
            bodyStyle={{ overflow: 'auto', maxHeight: 400 }}
            footer={null}
        >
            <div className="archived-modal-row">
                <div className="archived-modal-header width-33"> Milestone</div>
                <div className="archived-modal-header width-33"> Scope</div>
                <div className="archived-modal-header width-33"> Restore </div>
            </div>
            {agreements.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT))}
            {modifiedAgreements.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT))}
            {masterAgreements.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.MASTER_AGREEMENT))}
            {clientAgreements.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.CLIENT_AGREEMENT))}
            {purchaseOrders.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.PURCHASE_ORDER))}
            {invoices.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.INVOICE))}
            {drawings.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.DRAWINGS))}
            {calcs.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.CALCS))}
            {custDrawings.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.CUST_DRAWING))}
            {tabData.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.TAB_DATA))}
            {letters.map(milestone => this.getArchieveMilestone(milestone, Constant.DOC_TYPES.LETTER))}
        </Modal>
    }
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const scopes = task.scopes.filter(item => !item.isArchived);
    return {
        clientAgreements: task.clientAgreements.filter(item => item.isArchived),
        modifiedAgreements: task.modifiedAgreements.filter(item => item.isArchived),
        masterAgreements: task.masterAgreements.filter(item => item.isArchived),
        agreements: task.agreements.filter(item => item.isArchived),
        purchaseOrders: task.purchaseOrders.filter(item => item.isArchived),
        invoices: task.invoices.filter(item => item.isArchived),
        drawings: groupScopeRelatedMilestones(scopes, 'drawings').archived,
        calcs: groupScopeRelatedMilestones(scopes, 'calcs').archived,
        custDrawings: groupScopeRelatedMilestones(scopes, 'custDrawings').archived,
        tabData: groupScopeRelatedMilestones(scopes, 'tabData').archived,
        letters: groupScopeRelatedMilestones(scopes, 'letters').archived
    };
}

export const ArchivedMilestone = connect(mapStateToProps)(ArchivedMilestoneImpl);

